'use client';

import React, { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';

export interface CodeGeneratorProps {
  method: string;
  url: string;
  requestBody?: string;
  headers?: Record<string, string>;
}

export const CodeGenerator: React.FC<CodeGeneratorProps> = ({
  method,
  url,
  requestBody = '',
  headers = {},
}) => {
  const [lang, setLang] = useState<'curl' | 'js' | 'python' | 'node' | 'go'>('curl');
  const [copied, setCopied] = useState(false);

  const upperMethod = (method || 'GET').toUpperCase();

  const generateCurl = () => {
    let cmd = `curl -X ${upperMethod} "${url}"`;
    Object.entries(headers).forEach(([k, v]) => {
      cmd += ` \\\n  -H "${k}: ${v}"`;
    });
    if (requestBody && upperMethod !== 'GET') {
      cmd += ` \\\n  -d '${requestBody.replace(/'/g, "'\\''")}'`;
    }
    return cmd;
  };

  const generateJS = () => {
    return `fetch("${url}", {
  method: "${upperMethod}",
  headers: ${JSON.stringify(headers, null, 4)},
  ${requestBody && upperMethod !== 'GET' ? `body: JSON.stringify(${requestBody})` : ''}
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
  };

  const generatePython = () => {
    return `import requests

url = "${url}"
headers = ${JSON.stringify(headers, null, 4)}
${requestBody && upperMethod !== 'GET' ? `payload = ${requestBody}` : 'payload = None'}

response = requests.request("${upperMethod}", url, headers=headers, json=payload)
print(response.json())`;
  };

  const generateNode = () => {
    return `const axios = require('axios');

axios({
  method: '${upperMethod.toLowerCase()}',
  url: '${url}',
  headers: ${JSON.stringify(headers, null, 4)},
  ${requestBody && upperMethod !== 'GET' ? `data: ${requestBody}` : ''}
})
.then(response => console.log(response.data))
.catch(error => console.error(error));`;
  };

  const generateGo = () => {
    return `package main

import (
	"fmt"
	"io"
	"net/http"
	"strings"
)

func main() {
	url := "${url}"
	${requestBody && upperMethod !== 'GET' ? `payload := strings.NewReader(\`${requestBody}\`)` : 'payload := nil'}
	req, _ := http.NewRequest("${upperMethod}", url, payload)
	
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}`;
  };

  const getSnippet = () => {
    switch (lang) {
      case 'curl':
        return generateCurl();
      case 'js':
        return generateJS();
      case 'python':
        return generatePython();
      case 'node':
        return generateNode();
      case 'go':
        return generateGo();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between bg-card border border-border rounded px-3 py-1.5">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-beak" />
          <span className="text-foreground font-semibold text-[11px] uppercase tracking-wider">How to Use</span>
        </div>
        <div className="flex items-center gap-1">
          {(['curl', 'js', 'python', 'node', 'go'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`px-2 py-0.5 rounded text-[11px] uppercase transition-colors cursor-pointer ${
                lang === l ? 'bg-beak text-black font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {l}
            </button>
          ))}
          <button
            type="button"
            onClick={handleCopy}
            className="ml-2 flex items-center gap-1 px-2.5 py-1 rounded bg-muted hover:bg-muted text-foreground transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <pre className="p-4 bg-muted/40 border border-border rounded text-foreground overflow-x-auto text-[11px] leading-relaxed select-all">
        {getSnippet()}
      </pre>
    </div>
  );
};
