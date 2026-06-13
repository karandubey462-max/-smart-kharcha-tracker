package com.smartkharcha.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }
    
    @Override
    public void onStart() {
        super.onStart();
        
        // Get WebView and configure scroll settings
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            // Enable smooth scrolling
            webView.setOverScrollMode(WebView.OVER_SCROLL_IF_CONTENT_SCROLLS);
            webView.setVerticalScrollBarEnabled(false);
            webView.setHorizontalScrollBarEnabled(false);
            webView.setScrollbarFadingEnabled(true);
            
            // Enable touch and scroll
            webView.setFocusable(true);
            webView.setFocusableInTouchMode(true);
            
            // WebView settings
            WebSettings webSettings = webView.getSettings();
            webSettings.setDomStorageEnabled(true);
            webSettings.setDatabaseEnabled(true);
            webSettings.setJavaScriptEnabled(true);
            webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
            
            // Disable zoom but keep scroll
            webSettings.setSupportZoom(false);
            webSettings.setBuiltInZoomControls(false);
            webSettings.setDisplayZoomControls(false);
        }
    }
}
