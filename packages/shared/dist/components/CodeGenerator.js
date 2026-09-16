'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';
export const CodeGenerator = ({ method, url, requestBody = '', headers = {}, }) => {
    const [lang, setLang] = useState('curl');
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
    return (_jsxs("div", { className: "space-y-3 font-mono text-xs", children: [_jsxs("div", { className: "flex items-center justify-between bg-card border border-border rounded px-3 py-1.5", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Code, { className: "w-4 h-4 text-beak" }), _jsx("span", { className: "text-foreground font-semibold text-[11px] uppercase tracking-wider", children: "How to Use" })] }), _jsxs("div", { className: "flex items-center gap-1", children: [['curl', 'js', 'python', 'node', 'go'].map((l) => (_jsx("button", { type: "button", onClick: () => setLang(l), className: `px-2 py-0.5 rounded text-[11px] uppercase transition-colors cursor-pointer ${lang === l ? 'bg-beak text-black font-bold' : 'text-muted-foreground hover:text-foreground'}`, children: l }, l))), _jsxs("button", { type: "button", onClick: handleCopy, className: "ml-2 flex items-center gap-1 px-2.5 py-1 rounded bg-muted hover:bg-muted text-foreground transition-colors cursor-pointer", children: [copied ? _jsx(Check, { className: "w-3.5 h-3.5 text-emerald-400" }) : _jsx(Copy, { className: "w-3.5 h-3.5" }), _jsx("span", { className: "text-[10px]", children: copied ? 'Copied' : 'Copy' })] })] })] }), _jsx("pre", { className: "p-4 bg-muted/40 border border-border rounded text-foreground overflow-x-auto text-[11px] leading-relaxed select-all", children: getSnippet() })] }));
};
