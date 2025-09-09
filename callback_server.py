#!/usr/bin/env python3

import http.server
import socketserver
import urllib.parse
from threading import Thread
import time

class CallbackHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/callback'):
            # Parse the callback URL
            parsed = urllib.parse.urlparse(self.path)
            params = urllib.parse.parse_qs(parsed.query)
            
            if 'code' in params:
                # Success! Store the code
                self.server.auth_code = params['code'][0]
                
                # Send success response
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                
                success_html = """
                <html>
                <head><title>Spotify Authorization Successful</title></head>
                <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 100px;">
                    <h1 style="color: #1DB954;">✅ Authorization Successful!</h1>
                    <p>You can close this window and return to the terminal.</p>
                    <p>The Spotify CLI tool will now continue with authentication.</p>
                </body>
                </html>
                """
                self.wfile.write(success_html.encode())
                
            elif 'error' in params:
                # Error in authorization
                self.server.auth_error = params.get('error_description', ['Unknown error'])[0]
                
                self.send_response(400)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                
                error_html = f"""
                <html>
                <head><title>Spotify Authorization Failed</title></head>
                <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 100px;">
                    <h1 style="color: #E22134;">❌ Authorization Failed</h1>
                    <p>Error: {params.get('error_description', ['Unknown error'])[0]}</p>
                    <p>Please try again.</p>
                </body>
                </html>
                """
                self.wfile.write(error_html.encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        # Suppress default logging
        pass

def start_callback_server(port=8080):
    """Start a temporary callback server"""
    print(f"🚀 Starting callback server on port {port}...")
    
    with socketserver.TCPServer(("", port), CallbackHandler) as httpd:
        httpd.auth_code = None
        httpd.auth_error = None
        
        # Start server in a separate thread
        server_thread = Thread(target=httpd.serve_forever)
        server_thread.daemon = True
        server_thread.start()
        
        print(f"✅ Server running at http://localhost:{port}/callback")
        print("   (This will receive the OAuth callback)")
        
        # Wait for auth response (max 5 minutes)
        for _ in range(300):  # 300 seconds = 5 minutes
            if httpd.auth_code:
                print("✅ Authorization code received!")
                httpd.shutdown()
                return httpd.auth_code
            elif httpd.auth_error:
                print(f"❌ Authorization failed: {httpd.auth_error}")
                httpd.shutdown()
                return None
            time.sleep(1)
        
        print("⏰ Timeout waiting for authorization")
        httpd.shutdown()
        return None

if __name__ == '__main__':
    code = start_callback_server()
    if code:
        print(f"Auth code: {code[:20]}...")
    else:
        print("No auth code received")