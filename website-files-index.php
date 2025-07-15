<?php
// Dubai Visa Scam Report - React Application
// This PHP file ensures compatibility with PHP hosting

// Check if this is an API request
$requestUri = $_SERVER['REQUEST_URI'] ?? '';

// Handle API requests (return JSON error since we're on static hosting)
if (strpos($requestUri, '/api/') === 0) {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'API not available on static hosting',
        'message' => 'This is a static React application'
    ]);
    exit;
}

// For all other requests, serve the React application
if (file_exists('index.html')) {
    // Set proper content type
    header('Content-Type: text/html; charset=utf-8');
    
    // Read and output the React app
    readfile('index.html');
} else {
    // Fallback if index.html is missing
    http_response_code(404);
    echo '<!DOCTYPE html>
<html>
<head>
    <title>Dubai Visa Scam Report</title>
    <meta charset="utf-8">
</head>
<body>
    <h1>Dubai Visa Scam Report</h1>
    <p>Application files not found. Please deploy the React build.</p>
</body>
</html>';
}
?>
