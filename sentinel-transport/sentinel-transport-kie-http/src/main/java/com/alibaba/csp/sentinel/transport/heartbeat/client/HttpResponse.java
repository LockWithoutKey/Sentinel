/*
 * Copyright 1999-2018 Alibaba Group Holding Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.alibaba.csp.sentinel.transport.heartbeat.client;

import java.util.Map;

/**
 * Simple HTTP response representation.
 *
 * @author leyou
 */
public class HttpResponse {
    private String statusLine;
    private int statusCode;
    private Map<String, String> headers;
    private byte[] body;

    public HttpResponse(String statusLine, byte[] body) {
        this.statusLine = statusLine;
        this.body = body;
    }


    private void parseCode() {
        this.statusCode = Integer.parseInt(statusLine.split(" ")[1]);
    }

    public void setBody(byte[] body) {
        this.body = body;
    }

    public byte[] getBody() {
        return body;
    }

    public String getStatusLine() {
        return statusLine;
    }

    public Integer getStatusCode() {
        if (statusCode == 0) {
            parseCode();
        }
        return statusCode;
    }

    public Map<String, String> getHeaders() {
        return headers;
    }

    /**
     * Get header of the key ignoring case.
     *
     * @param key header key
     * @return header value
     */
    public String getHeader(String key) {
        if (headers == null) {
            return null;
        }
        String value = headers.get(key);
        if (value != null) {
            return value;
        }
        for (Map.Entry<String, String> entry : headers.entrySet()) {
            if (entry.getKey().equalsIgnoreCase(key)) {
                return entry.getValue();
            }
        }
        return null;
    }
}
