# 프레임워크/라이브러리 변경이 Playwright MCP 토큰 사용량에 미치는 영향 분석

이 문서는 웹 애플리케이션 개발에 사용된 프레임워크나 라이브러리(예: Next.js, React, Vue, Angular 등)의 차이가 Playwright MCP(Model Context Protocol)를 사용한 테스트 자동화 시 AI 모델의 토큰 사용량에 미치는 잠재적 영향에 대해 설명합니다.

## 핵심 결론

일반적으로, **서로 다른 프레임워크/라이브러리를 사용하여 기능적으로 동일한 페이지를 구현했을 경우, 사용된 기술 스택 자체의 차이가 Playwright MCP가 사용하는 토큰 수에 직접적으로 큰 영향을 미치지는 않을 가능성이 높습니다.** 다만, 약간의 변동성은 존재할 수 있습니다.

## 상세 설명

1.  **Playwright와 최종 렌더링 결과**:
    *   Playwright는 어떤 프레임워크로 만들어졌는지와 관계없이, 최종적으로 브라우저에 렌더링된 DOM(Document Object Model) 구조 및 화면 표시 내용을 기준으로 상호작용합니다.
    *   MCP 도구는 Playwright가 상호작용하는 시점(주로 페이지 안정화 후)의 브라우저 상태를 캡처하여 AI 모델에게 컨텍스트로 제공합니다.

2.  **기능적 동일성 vs. 구현 방식의 차이**:
    *   React, Vue, Angular 등은 내부적으로 컴포넌트를 구성하고 상태를 관리하며 UI를 렌더링하는 방식에 차이가 있습니다.
    *   하지만 **동일한 UI 디자인과 기능을 목표로 페이지를 구현**했다면, 최종적으로 브라우저에 그려지는 HTML 구조와 사용자에게 보이는 텍스트 콘텐츠는 **매우 유사**해야 합니다. 예를 들어, 동일한 로그인 폼, 동일한 데이터 테이블 등은 프레임워크에 관계없이 시각적으로나 구조적으로 비슷하게 구현될 것입니다.

3.  **프레임워크별 미세한 차이점**:
    *   **DOM 구조**: 각 프레임워크는 컴포넌트를 렌더링할 때 약간씩 다른 부가적인 HTML 구조를 생성할 수 있습니다. 예를 들어, 특정 프레임워크는 추가적인 `<div>` 래퍼(wrapper) 요소를 사용하거나, 내부적인 상태 관리나 스타일링을 위해 고유한 HTML 속성(예: Vue의 `data-v-...`, Angular의 `_ngcontent-...`, React의 `data-reactroot` 등)을 자동으로 추가할 수 있습니다.
    *   **이벤트 처리 및 내부 메커니즘**: 이벤트 리스너를 연결하거나 상태 변경을 감지하는 내부적인 방식은 다르지만, 이는 Playwright가 직접 상호작용하는 최종 DOM 요소(버튼, 링크, 입력 필드 등) 자체의 존재 유무나 기본적인 구조에는 큰 영향을 주지 않습니다.

4.  **토큰 사용량에 미치는 영향**:
    *   프레임워크별로 생성되는 최종 DOM 구조의 미세한 차이(부가적인 래퍼 요소, 고유 속성 등)는 MCP가 캡처하는 HTML 텍스트의 전체 양에 **약간의 영향**을 줄 수 있습니다. 어떤 프레임워크는 다른 프레임워크보다 결과적으로 약간 더 많은 (또는 더 적은) HTML 마크업을 생성할 수 있습니다.
    *   하지만 페이지의 **핵심 콘텐츠**(사용자에게 보이는 텍스트, 이미지 정보, 데이터 등)와 **주요 상호작용 요소**(버튼, 입력 필드, 링크 등)가 기능적으로 동일하다면, 이러한 프레임워크별 부가적인 마크업 차이가 전체 캡처 컨텍스트에서 차지하는 비중은 상대적으로 작을 가능성이 높습니다.
    *   따라서, 사용된 프레임워크/라이브러리가 다르다는 이유만으로 토큰 사용량에 **약간의 변동**은 발생할 수 있지만, 이것이 **테스트 비용을 극적으로 변화시킬 정도의 큰 차이를 유발할 가능성은 낮습니다.**

## 요약

React, Vue, Angular 등 다양한 기술 스택을 사용하여 **기능적으로 동일한 웹 페이지**를 구현하고 이를 Playwright MCP로 테스트할 때, 사용되는 토큰 수는 **약간의 차이**를 보일 수 있습니다. 이는 각 프레임워크가 최종적으로 생성하는 DOM 구조의 미세한 차이에서 비롯됩니다.

그러나 페이지의 핵심 내용과 기능적 요소가 동일하다면, 이러한 프레임워크 간의 차이가 **토큰 비용에 미치는 영향은 일반적으로 크지 않을 것**으로 예상됩니다. 토큰 사용량에 가장 큰 영향을 미치는 요소는 여전히 **테스트 대상 페이지 자체의 복잡성(표시되는 정보의 양, DOM 구조의 깊이와 너비 등)**과 **테스트 스크립트가 MCP를 통해 어떤 정보를 얼마나 자주, 상세하게 캡처하는지**에 대한 로직입니다.
