import type { BeautyClientConfig, VisionAnalysisResponse, VisionAnalysisOptions } from './types';
import type { AssessmentEvaluateRequest, AssessmentEvaluateResponse } from './assessment-types';

export class FormSubClient {
  constructor(private client: BeautyClient) {}

  async evaluate(
    code: string,
    payload: {
      answers: any;
      customer_conditions?: Record<string, boolean>;
      brand_id?: string;
      application_id?: string;
    }
  ): Promise<any> {
    return this.client.request(`/core/form-engine/survey/${code}/evaluate`, {
      method: 'POST',
      body: JSON.stringify({
        brand_id: payload.brand_id || this.client.config.brandId,
        application_id: payload.application_id || this.client.config.applicationId,
        ...payload,
      }),
    });
  }

  async getQuestionnaire(code: string): Promise<any> {
    return this.client.request(`/core/form-engine/survey/${code}`, {
      method: 'GET',
    });
  }
}

export class VisionSubClient {
  constructor(private client: BeautyClient) {}

  async analyzeImages(
    images: Blob | Blob[],
    options?: VisionAnalysisOptions
  ): Promise<VisionAnalysisResponse> {
    return this.client.analyzeImages(images, options);
  }

  async analyzeImage(
    imageBlob: Blob,
    options?: VisionAnalysisOptions
  ): Promise<VisionAnalysisResponse> {
    return this.client.analyzeImages(imageBlob, options);
  }
}

export class MatchSubClient {
  constructor(private client: BeautyClient) {}

  async evaluate(payload: {
    dimension_scores: Record<string, number>;
    customer_conditions?: Record<string, boolean>;
    preferences?: any;
    brand_id?: string;
    application_id?: string;
  }): Promise<any> {
    return this.client.request(`/core/match-engine/evaluate`, {
      method: 'POST',
      body: JSON.stringify({
        brand_id: payload.brand_id || this.client.config.brandId,
        application_id: payload.application_id || this.client.config.applicationId,
        ...payload,
      }),
    });
  }
}

export class ReferenceSubClient {
  constructor(private client: BeautyClient) {}

  async getSkinDimensions(): Promise<any> {
    return this.client.request(`/core/reference-service/api/dimensions`, {
      method: 'GET',
    });
  }
}

export class AssessmentsSubClient {
  constructor(private client: BeautyClient) {}

  async evaluate(
    request: Omit<AssessmentEvaluateRequest, 'brand_id' | 'application_id'> & {
      brand_id?: string;
      application_id?: string;
    }
  ): Promise<AssessmentEvaluateResponse> {
    return this.client.evaluateAssessment(request);
  }
}

export class BeautyClient {
  public config: BeautyClientConfig;

  public form: FormSubClient;
  public vision: VisionSubClient;
  public match: MatchSubClient;
  public reference: ReferenceSubClient;
  public assessments: AssessmentsSubClient;

  constructor(config: BeautyClientConfig) {
    this.config = {
      ...config,
      gatewayUrl: config.gatewayUrl.replace(/\/$/, ''),
    };

    this.form = new FormSubClient(this);
    this.vision = new VisionSubClient(this);
    this.match = new MatchSubClient(this);
    this.reference = new ReferenceSubClient(this);
    this.assessments = new AssessmentsSubClient(this);
  }

  /**
   * Internal generic request helper with auth headers
   */
  async request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.gatewayUrl}${path.startsWith('/') ? path : '/' + path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }
    if (this.config.token) {
      headers['Authorization'] = `Bearer ${this.config.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gateway request to ${path} failed (${response.status}): ${errBody}`);
    }

    return response.json();
  }

  /**
   * Unified single-hit multi-modal assessment evaluation (<50ms).
   */
  async evaluateAssessment(
    request: Omit<AssessmentEvaluateRequest, 'brand_id' | 'application_id'> & {
      brand_id?: string;
      application_id?: string;
    }
  ): Promise<AssessmentEvaluateResponse> {
    const payload: AssessmentEvaluateRequest = {
      brand_id: request.brand_id || this.config.brandId,
      application_id: request.application_id || this.config.applicationId,
      ...request,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }
    if (this.config.token) {
      headers['Authorization'] = `Bearer ${this.config.token}`;
    }

    // core-engine owns assessments now; the gateway's own
    // /api/v1/assessments/evaluate is being retired. Survey evaluate stores
    // the result and reports assessment_id.
    const url = `${this.config.gatewayUrl}/core/form-engine/evaluate`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Assessment evaluation failed (${response.status}): ${errBody}`);
    }

    return response.json();
  }

  /**
   * Submits unlabelled face captures to Vision Engine in a single call.
   * Head pose and 8-zone arbitration are executed autonomously on the backend.
   */
  async analyzeImages(
    images: Blob | Blob[],
    options?: VisionAnalysisOptions
  ): Promise<VisionAnalysisResponse> {
    const formData = new FormData();
    const imageList = Array.isArray(images) ? images : [images];

    imageList.forEach((blob, idx) => {
      formData.append('images', blob, `capture_${idx + 1}.jpg`);
    });

    if (imageList.length > 0) {
      formData.append('image', imageList[0], 'capture_1.jpg');
    }

    formData.append('brandId', this.config.brandId);
    formData.append('applicationId', this.config.applicationId);

    if (options?.dimensions && options.dimensions.length > 0) {
      formData.append('dimensions', options.dimensions.join(','));
    }
    if (options?.skinConcerns && options.skinConcerns.length > 0) {
      formData.append('skinConcerns', options.skinConcerns.join(','));
    }
    if (options?.chronologicalAge !== undefined) {
      formData.append('chronologicalAge', options.chronologicalAge.toString());
    } else if (options?.currentAge !== undefined) {
      formData.append('currentAge', options.currentAge.toString());
    }
    if (options?.uvIndex !== undefined) {
      formData.append('uvIndex', options.uvIndex.toString());
    }
    if (options?.baselineScore !== undefined) {
      formData.append('baselineScore', options.baselineScore.toString());
    }
    if (options?.regimenEfficacyFactor !== undefined) {
      formData.append('regimenEfficacyFactor', options.regimenEfficacyFactor.toString());
    }

    const headers: Record<string, string> = {};
    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }
    if (this.config.token) {
      headers['Authorization'] = `Bearer ${this.config.token}`;
    }

    // Try routing via core vision engine endpoint, falling back to top-level endpoint
    const url = `${this.config.gatewayUrl}/api/vision/analyze`;
    let response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok && response.status === 404) {
      const fallbackUrl = `${this.config.gatewayUrl}/core/vision-engine/analyze-image`;
      response = await fetch(fallbackUrl, {
        method: 'POST',
        headers,
        body: formData,
      });
    }

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Vision analysis failed (${response.status}): ${errBody}`);
    }

    return response.json();
  }

  /**
   * Submits a single captured face image to Vision Engine.
   */
  async analyzeImage(
    imageBlob: Blob,
    options?: VisionAnalysisOptions
  ): Promise<VisionAnalysisResponse> {
    return this.analyzeImages(imageBlob, options);
  }
}

