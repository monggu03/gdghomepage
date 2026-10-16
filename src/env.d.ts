interface ImportMetaEnv {
  /** 'http' 이면 Spring Boot API, 아니면 예시 데이터 */
  readonly VITE_DATA_SOURCE?: 'mock' | 'http'
  readonly VITE_API_BASE?: string
  /** 'hash' 이면 #/projects 형태 주소 (정적 미리보기용), 아니면 /projects */
  readonly VITE_ROUTER?: 'browser' | 'hash'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
