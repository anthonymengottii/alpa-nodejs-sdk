/**
 * Classes de erro customizadas para o SDK
 */

export class AlpaError extends Error {
  public code?: string;
  public status?: number;
  /** Alias de `status` (mantido por conveniência). */
  public statusCode?: number;
  public details?: unknown;

  constructor(
    message: string,
    code?: string,
    status?: number,
    details?: unknown
  ) {
    super(message);
    this.name = 'AlpaError';
    this.code = code;
    this.status = status;
    this.statusCode = status;
    this.details = details;

    // Mantém o stack trace correto
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AlpaError);
    }
  }
}

export class AlpaAuthenticationError extends AlpaError {
  constructor(message: string = 'Falha na autenticação. Verifique sua API key.') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AlpaAuthenticationError';
  }
}

export class AlpaValidationError extends AlpaError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'AlpaValidationError';
  }
}

export class AlpaNotFoundError extends AlpaError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} com ID ${id} não encontrado.` : `${resource} não encontrado.`,
      'NOT_FOUND',
      404
    );
    this.name = 'AlpaNotFoundError';
  }
}

export class AlpaRateLimitError extends AlpaError {
  constructor(message: string = 'Limite de requisições excedido. Tente novamente mais tarde.') {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'AlpaRateLimitError';
  }
}

export class AlpaServerError extends AlpaError {
  constructor(message: string = 'Erro interno do servidor. Tente novamente mais tarde.') {
    super(message, 'SERVER_ERROR', 500);
    this.name = 'AlpaServerError';
  }
}

/**
 * Converte erros HTTP em erros do SDK
 */
export function handleApiError(response: Response, body?: { message?: string; code?: string; id?: string; details?: unknown }): AlpaError {
  const status = response.status;
  const message = body?.message || `HTTP ${status}: ${response.statusText}`;
  const code = body?.code;

  switch (status) {
    case 401:
      return new AlpaAuthenticationError(message);
    case 400:
      return new AlpaValidationError(message, body?.details);
    case 404:
      return new AlpaNotFoundError('Recurso', body?.id);
    case 429:
      return new AlpaRateLimitError(message);
    case 500:
    case 502:
    case 503:
      return new AlpaServerError(message);
    default:
      return new AlpaError(message, code, status, body);
  }
}
