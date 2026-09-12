<?php

namespace App\Services;

use Google\Auth\Credentials\ServiceAccountCredentials;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Factory;

class FirebaseService
{
    protected ?string $projectId = null;
    protected ?string $credentialsPath = null;
    protected ?Client $httpClient = null;
    protected ?string $cachedToken = null;
    protected int $tokenExpiresAt = 0;
    protected ?Factory $factory = null;

    public function __construct()
    {
        $this->credentialsPath = config('services.firebase.credentials') ?: env('FIREBASE_CREDENTIALS');
        $this->projectId = config('services.firebase.project_id') ?: env('FIREBASE_PROJECT_ID', 'clim8bit');
        $this->httpClient = new Client([
            'timeout' => 5.0,
        ]);
    }

    /**
     * Resolve credentials source (file path or parsed array).
     */
    protected function resolveCredentialsSource(): string|array|null
    {
        $raw = $this->credentialsPath;

        // 1. Raw JSON string or Base64 encoded JSON
        if (!empty($raw) && is_string($raw)) {
            $trimmed = trim($raw);
            if (str_starts_with($trimmed, '{')) {
                $decoded = json_decode($trimmed, true);
                if (!empty($decoded['client_email'])) {
                    return $decoded;
                }
            }
            // Try base64
            $b64 = base64_decode($trimmed, true);
            if ($b64 && str_starts_with(trim($b64), '{')) {
                $decoded = json_decode(trim($b64), true);
                if (!empty($decoded['client_email'])) {
                    return $decoded;
                }
            }
        }

        // 2. Direct file path if exists
        if (!empty($raw) && is_string($raw) && file_exists($raw)) {
            return $raw;
        }

        // 3. Known project paths (relative to base path or repo root)
        $candidates = [
            base_path('../key/clim8bit-firebase-adminsdk-fbsvc-6aa18172f7.json'),
            base_path('key/clim8bit-firebase-adminsdk-fbsvc-6aa18172f7.json'),
            dirname(base_path()) . '/key/clim8bit-firebase-adminsdk-fbsvc-6aa18172f7.json',
            '/var/task/key/clim8bit-firebase-adminsdk-fbsvc-6aa18172f7.json',
        ];

        foreach ($candidates as $candidate) {
            if (file_exists($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    /**
     * Get an authorized bearer token using service account credentials.
     */
    public function getAccessToken(): ?string
    {
        if ($this->cachedToken && time() < ($this->tokenExpiresAt - 60)) {
            return $this->cachedToken;
        }

        $source = $this->resolveCredentialsSource();
        if (!$source) {
            Log::warning("Firebase credentials could not be resolved from path or environment.");
            return null;
        }

        try {
            $credentials = new ServiceAccountCredentials(
                [
                    'https://www.googleapis.com/auth/datastore',
                    'https://www.googleapis.com/auth/cloud-platform',
                    'https://www.googleapis.com/auth/firebase.database',
                ],
                $source
            );

            $tokenData = $credentials->fetchAuthToken();
            if (!empty($tokenData['access_token'])) {
                $this->cachedToken = $tokenData['access_token'];
                $this->tokenExpiresAt = time() + ($tokenData['expires_in'] ?? 3600);
                return $this->cachedToken;
            }
        } catch (\Throwable $e) {
            Log::error("Failed to fetch Firebase access token: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Get Firestore REST API base URL.
     */
    protected function getFirestoreBaseUrl(): string
    {
        return "https://firestore.googleapis.com/v1/projects/{$this->projectId}/databases/(default)/documents";
    }

    /**
     * Check if Firestore is provisioned and enabled.
     */
    public function isFirestoreAvailable(): bool
    {
        $token = $this->getAccessToken();
        if (!$token) {
            return false;
        }

        try {
            $url = "https://firestore.googleapis.com/v1/projects/{$this->projectId}/databases/(default)";
            $response = $this->httpClient->get($url, [
                'headers' => ['Authorization' => "Bearer {$token}"],
                'http_errors' => false,
            ]);
            return $response->getStatusCode() === 200;
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Retrieve a Firestore document by ID.
     */
    public function getDocument(string $collection, string $id): ?array
    {
        $token = $this->getAccessToken();
        if (!$token) return null;

        try {
            $url = "{$this->getFirestoreBaseUrl()}/{$collection}/{$id}";
            $response = $this->httpClient->get($url, [
                'headers' => ['Authorization' => "Bearer {$token}"],
                'http_errors' => false,
            ]);

            if ($response->getStatusCode() === 200) {
                $json = json_decode($response->getBody()->getContents(), true);
                return $this->formatDocumentFromFirestore($json);
            }
        } catch (\Throwable $e) {
            Log::error("Firestore getDocument error [{$collection}/{$id}]: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Query documents in a collection.
     */
    public function getCollection(string $collection, ?string $whereField = null, mixed $whereValue = null): array
    {
        $token = $this->getAccessToken();
        if (!$token) return [];

        try {
            if ($whereField !== null) {
                // Structured query
                $url = "https://firestore.googleapis.com/v1/projects/{$this->projectId}/databases/(default)/documents:runQuery";
                $query = [
                    'structuredQuery' => [
                        'from' => [['collectionId' => $collection]],
                        'where' => [
                            'fieldFilter' => [
                                'field' => ['fieldPath' => $whereField],
                                'op' => 'EQUAL',
                                'value' => $this->encodeFirestoreValue($whereValue),
                            ],
                        ],
                    ],
                ];

                $response = $this->httpClient->post($url, [
                    'headers' => [
                        'Authorization' => "Bearer {$token}",
                        'Content-Type' => 'application/json',
                    ],
                    'json' => $query,
                    'http_errors' => false,
                ]);

                if ($response->getStatusCode() === 200) {
                    $results = json_decode($response->getBody()->getContents(), true);
                    $docs = [];
                    foreach ($results as $item) {
                        if (!empty($item['document'])) {
                            $docs[] = $this->formatDocumentFromFirestore($item['document']);
                        }
                    }
                    return $docs;
                }
            } else {
                $url = "{$this->getFirestoreBaseUrl()}/{$collection}";
                $response = $this->httpClient->get($url, [
                    'headers' => ['Authorization' => "Bearer {$token}"],
                    'http_errors' => false,
                ]);

                if ($response->getStatusCode() === 200) {
                    $results = json_decode($response->getBody()->getContents(), true);
                    $docs = [];
                    foreach ($results['documents'] ?? [] as $doc) {
                        $docs[] = $this->formatDocumentFromFirestore($doc);
                    }
                    return $docs;
                }
            }
        } catch (\Throwable $e) {
            Log::error("Firestore getCollection error [{$collection}]: " . $e->getMessage());
        }

        return [];
    }

    /**
     * Create or overwrite a document with a specified ID.
     */
    public function setDocument(string $collection, string $id, array $data): bool
    {
        $token = $this->getAccessToken();
        if (!$token) return false;

        try {
            $url = "{$this->getFirestoreBaseUrl()}/{$collection}/{$id}";
            $firestoreFields = $this->encodeFirestoreFields($data);

            $response = $this->httpClient->patch($url, [
                'headers' => [
                    'Authorization' => "Bearer {$token}",
                    'Content-Type' => 'application/json',
                ],
                'json' => ['fields' => $firestoreFields],
                'http_errors' => false,
            ]);

            return in_array($response->getStatusCode(), [200, 201]);
        } catch (\Throwable $e) {
            Log::error("Firestore setDocument error [{$collection}/{$id}]: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Add a document with auto-generated ID.
     */
    public function addDocument(string $collection, array $data): ?string
    {
        $token = $this->getAccessToken();
        if (!$token) return null;

        try {
            $url = "{$this->getFirestoreBaseUrl()}/{$collection}";
            $firestoreFields = $this->encodeFirestoreFields($data);

            $response = $this->httpClient->post($url, [
                'headers' => [
                    'Authorization' => "Bearer {$token}",
                    'Content-Type' => 'application/json',
                ],
                'json' => ['fields' => $firestoreFields],
                'http_errors' => false,
            ]);

            if (in_array($response->getStatusCode(), [200, 201])) {
                $body = json_decode($response->getBody()->getContents(), true);
                $name = $body['name'] ?? '';
                $parts = explode('/', $name);
                return end($parts) ?: null;
            }
        } catch (\Throwable $e) {
            Log::error("Firestore addDocument error [{$collection}]: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Delete a document by ID.
     */
    public function deleteDocument(string $collection, string $id): bool
    {
        $token = $this->getAccessToken();
        if (!$token) return false;

        try {
            $url = "{$this->getFirestoreBaseUrl()}/{$collection}/{$id}";
            $response = $this->httpClient->delete($url, [
                'headers' => ['Authorization' => "Bearer {$token}"],
                'http_errors' => false,
            ]);

            return in_array($response->getStatusCode(), [200, 204]);
        } catch (\Throwable $e) {
            Log::error("Firestore deleteDocument error [{$collection}/{$id}]: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Helper to encode PHP array into Firestore fields.
     */
    protected function encodeFirestoreFields(array $data): array
    {
        $fields = [];
        foreach ($data as $key => $value) {
            $fields[$key] = $this->encodeFirestoreValue($value);
        }
        return $fields;
    }

    /**
     * Helper to encode a single PHP value to Firestore field type.
     */
    protected function encodeFirestoreValue(mixed $value): array
    {
        if (is_null($value)) {
            return ['nullValue' => null];
        }
        if (is_bool($value)) {
            return ['booleanValue' => $value];
        }
        if (is_int($value)) {
            return ['integerValue' => (string) $value];
        }
        if (is_float($value)) {
            return ['doubleValue' => $value];
        }
        if (is_array($value)) {
            // Check if associative
            if (array_keys($value) !== range(0, count($value) - 1)) {
                return ['mapValue' => ['fields' => $this->encodeFirestoreFields($value)]];
            }
            $arrayValues = [];
            foreach ($value as $item) {
                $arrayValues[] = $this->encodeFirestoreValue($item);
            }
            return ['arrayValue' => ['values' => $arrayValues]];
        }
        return ['stringValue' => (string) $value];
    }

    /**
     * Format a Firestore raw document into standard key-value array.
     */
    protected function formatDocumentFromFirestore(array $doc): array
    {
        $result = [];
        if (!empty($doc['name'])) {
            $parts = explode('/', $doc['name']);
            $result['id'] = end($parts);
        }

        foreach ($doc['fields'] ?? [] as $key => $val) {
            $result[$key] = $this->decodeFirestoreValue($val);
        }

        return $result;
    }

    /**
     * Decode Firestore field value to PHP native value.
     */
    protected function decodeFirestoreValue(array $val): mixed
    {
        if (array_key_exists('stringValue', $val)) return $val['stringValue'];
        if (array_key_exists('integerValue', $val)) return (int) $val['integerValue'];
        if (array_key_exists('doubleValue', $val)) return (float) $val['doubleValue'];
        if (array_key_exists('booleanValue', $val)) return (bool) $val['booleanValue'];
        if (array_key_exists('timestampValue', $val)) return $val['timestampValue'];
        if (array_key_exists('nullValue', $val)) return null;
        if (array_key_exists('mapValue', $val)) {
            $map = [];
            foreach ($val['mapValue']['fields'] ?? [] as $k => $v) {
                $map[$k] = $this->decodeFirestoreValue($v);
            }
            return $map;
        }
        if (array_key_exists('arrayValue', $val)) {
            $list = [];
            foreach ($val['arrayValue']['values'] ?? [] as $item) {
                $list[] = $this->decodeFirestoreValue($item);
            }
            return $list;
        }
        return null;
    }

    /**
     * High-level: Save or update user document in Firestore collection 'users'.
     */
    public function syncUser(array $userData): bool
    {
        $id = (string) ($userData['id'] ?? md5($userData['email'] ?? ''));
        return $this->setDocument('users', $id, $userData);
    }

    /**
     * High-level: Query user document from Firestore by email.
     */
    public function getUserByEmail(string $email): ?array
    {
        $users = $this->getCollection('users', 'email', $email);
        return !empty($users) ? $users[0] : null;
    }

    /**
     * High-level: Delete user document from Firestore.
     */
    public function deleteUser(string|int $userId): bool
    {
        return $this->deleteDocument('users', (string) $userId);
    }

    /**
     * High-level: Save or update favorite in Firestore collection 'favorites'.
     */
    public function syncFavorite(array $favData): bool
    {
        $id = (string) ($favData['id'] ?? uniqid('fav_'));
        return $this->setDocument('favorites', $id, $favData);
    }

    /**
     * High-level: Delete favorite document from Firestore.
     */
    public function deleteFavorite(string|int $favoriteId): bool
    {
        return $this->deleteDocument('favorites', (string) $favoriteId);
    }

    /**
     * High-level: Get favorites for a specific user.
     */
    public function getFavoritesForUser(string|int $userId): array
    {
        return $this->getCollection('favorites', 'user_id', (int) $userId);
    }

    /**
     * High-level: Save recent search to Firestore.
     */
    public function syncRecentSearch(array $searchData): ?string
    {
        return $this->addDocument('recent_searches', $searchData);
    }

    /**
     * High-level: Get recent searches for a user from Firestore.
     */
    public function getRecentSearchesForUser(string|int $userId): array
    {
        return $this->getCollection('recent_searches', 'user_id', (int) $userId);
    }

    /**
     * High-level: Clear recent searches for a user in Firestore.
     */
    public function clearRecentSearches(string|int $userId): bool
    {
        $searches = $this->getRecentSearchesForUser($userId);
        foreach ($searches as $search) {
            if (!empty($search['id'])) {
                $this->deleteDocument('recent_searches', $search['id']);
            }
        }
        return true;
    }
}

