---
"@gateway-experience/beauty-sdk": minor
---

Assessment evaluation is available without the legacy client: `evaluateAssessment(config, surveyCode, request)` and `gatewayAssessmentEvaluator(config)` (both from `/core` and the root). `useSkinAssessment` takes an optional `evaluator` and no longer constructs the legacy `BeautyClient`; with none given it calls the gateway exactly as before. The legacy `BeautyClient` class is deprecated in favour of `createBeautyClient` from `/client`; it still works unchanged.
