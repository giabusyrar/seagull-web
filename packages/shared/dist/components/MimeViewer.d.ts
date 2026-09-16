import React from 'react';
export interface MimeViewerProps {
    contentType?: string;
    responseBody: string;
    responseBlobUrl?: string;
    filename?: string;
    className?: string;
}
export declare const MimeViewer: React.FC<MimeViewerProps>;
