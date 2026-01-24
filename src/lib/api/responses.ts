/**
 * API Response Utilities
 *
 * Standardized response helpers with proper HTTP status codes
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  details?: unknown
}

export interface PaginatedResponse<T = unknown> {
  success: true
  data: T[]
  pagination: {
    total: number
    limit: number
    offset: number
    page?: number
    totalPages?: number
  }
}

// ============================================================================
// SUCCESS RESPONSES
// ============================================================================

export function successResponse<T>(
  data: T,
  options?: { message?: string; status?: number }
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message: options?.message,
    },
    { status: options?.status ?? 200 }
  )
}

export function createdResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiSuccessResponse<T>> {
  return successResponse(data, { message, status: 201 })
}

export function paginatedResponse<T>(
  data: T[],
  pagination: {
    total: number
    limit: number
    offset: number
  }
): NextResponse<PaginatedResponse<T>> {
  const totalPages = Math.ceil(pagination.total / pagination.limit)
  const page = Math.floor(pagination.offset / pagination.limit) + 1

  return NextResponse.json(
    {
      success: true,
      data,
      pagination: {
        ...pagination,
        page,
        totalPages,
      },
    },
    { status: 200 }
  )
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

export function errorResponse(
  error: string,
  options?: { details?: unknown; status?: number }
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      details: options?.details,
    },
    { status: options?.status ?? 500 }
  )
}

export function badRequestResponse(
  error: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return errorResponse(error, { details, status: 400 })
}

export function notFoundResponse(
  resource: string = 'Resource'
): NextResponse<ApiErrorResponse> {
  return errorResponse(`${resource} not found`, { status: 404 })
}

export function conflictResponse(
  error: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return errorResponse(error, { details, status: 409 })
}

export function unauthorizedResponse(
  error: string = 'Unauthorized'
): NextResponse<ApiErrorResponse> {
  return errorResponse(error, { status: 401 })
}

export function forbiddenResponse(
  error: string = 'Forbidden'
): NextResponse<ApiErrorResponse> {
  return errorResponse(error, { status: 403 })
}

// ============================================================================
// ERROR HANDLER
// ============================================================================

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error)

  // Zod validation errors
  if (error instanceof ZodError) {
    return badRequestResponse('Validation error', {
      errors: error.issues.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    })
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return conflictResponse('A record with this value already exists', {
          field: error.meta?.target,
        })
      case 'P2025':
        return notFoundResponse('Record')
      case 'P2003':
        return badRequestResponse('Invalid foreign key reference', {
          field: error.meta?.field_name,
        })
      default:
        return errorResponse('Database error', {
          details: { code: error.code },
          status: 500,
        })
    }
  }

  // Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return badRequestResponse('Invalid data provided')
  }

  // Standard errors
  if (error instanceof Error) {
    return errorResponse(error.message)
  }

  // Unknown errors
  return errorResponse('An unexpected error occurred')
}
