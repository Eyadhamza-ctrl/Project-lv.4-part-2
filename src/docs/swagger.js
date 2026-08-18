import swaggerUi from 'swagger-ui-express';

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'EventPulse API',
    version: '1.0.0',
    description: 'Production-ready Event Management Backend API with Socket.io, JWT Authentication, and RBAC'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66b123456789abcdef123456' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john@example.com' },
          role: { type: 'string', enum: ['admin', 'attendee'], example: 'attendee' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Event: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66b987654321fedcba654321' },
          title: { type: 'string', example: 'Tech Conference 2026' },
          description: { type: 'string', example: 'Annual flagship developer conference.' },
          category: { type: 'string', example: 'Technology' },
          city: { type: 'string', example: 'Cairo' },
          venue: { type: 'string', example: 'Grand Convention Center' },
          date: { type: 'string', format: 'date-time', example: '2026-10-10T10:00:00.000Z' },
          capacity: { type: 'integer', example: 500 },
          attendeesCount: { type: 'integer', example: 42 },
          popularity: { type: 'integer', example: 210 },
          image: { type: 'string', example: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4' },
          createdBy: { type: 'string', example: '66b123456789abcdef123456' }
        }
      },
      Registration: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66b112233445566778899a' },
          user: { type: 'string', example: '66b123456789abcdef123456' },
          event: { type: 'string', example: '66b987654321fedcba654321' },
          registeredAt: { type: 'string', format: 'date-time' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          status: { type: 'string', example: 'fail' },
          message: { type: 'string', example: 'Error description message' }
        }
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Invalid email' }
              }
            }
          }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        summary: 'System health check',
        tags: ['Health'],
        responses: {
          200: {
            description: 'Server and Database status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    database: { type: 'string', example: 'connected' },
                    uptime: { type: 'number', example: 124.5 },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', example: 'john@example.com' },
                  password: { type: 'string', example: 'secret123' },
                  role: { type: 'string', enum: ['admin', 'attendee'], example: 'attendee' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'User registered successfully' },
          400: { description: 'User already exists' },
          422: { description: 'Validation error' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'User login',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'john@example.com' },
                  password: { type: 'string', example: 'secret123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'User logged in successfully' },
          401: { description: 'Invalid credentials' },
          422: { description: 'Validation error' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current user profile',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Current profile retrieved' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/events': {
      get: {
        summary: 'Get all events with search, filter, sorting, pagination',
        tags: ['Events'],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'sort', in: 'query', schema: { type: 'string', example: 'date' } },
          { name: 'category', in: 'query', schema: { type: 'string', example: 'Music' } },
          { name: 'city', in: 'query', schema: { type: 'string', example: 'Cairo' } },
          { name: 'date', in: 'query', schema: { type: 'string', example: '2026-10-10' } },
          { name: 'search', in: 'query', schema: { type: 'string', example: 'concert' } }
        ],
        responses: {
          200: { description: 'Events retrieved successfully' }
        }
      },
      post: {
        summary: 'Create a new event (Admin only)',
        tags: ['Events'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description', 'category', 'city', 'venue', 'date', 'capacity'],
                properties: {
                  title: { type: 'string', example: 'Cairo Jazz Festival' },
                  description: { type: 'string', example: 'Annual international jazz event.' },
                  category: { type: 'string', example: 'Music' },
                  city: { type: 'string', example: 'Cairo' },
                  venue: { type: 'string', example: 'Cairo Opera House' },
                  date: { type: 'string', format: 'date-time', example: '2026-10-10T19:00:00.000Z' },
                  capacity: { type: 'integer', example: 300 },
                  image: { type: 'string', example: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Event created successfully' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin required' }
        }
      }
    },
    '/api/events/{id}': {
      get: {
        summary: 'Get event by ID',
        tags: ['Events'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Event details' },
          404: { description: 'Event not found' }
        }
      },
      patch: {
        summary: 'Update event (Admin only)',
        tags: ['Events'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  capacity: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Event updated' },
          403: { description: 'Forbidden' },
          404: { description: 'Event not found' }
        }
      },
      delete: {
        summary: 'Delete event (Admin only)',
        tags: ['Events'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Event deleted' },
          403: { description: 'Forbidden' },
          404: { description: 'Event not found' }
        }
      }
    },
    '/api/events/{id}/register': {
      post: {
        summary: 'Register logged-in user for an event',
        tags: ['Registrations'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          201: { description: 'Registered successfully' },
          400: { description: 'Event full or user already registered' },
          404: { description: 'Event not found' }
        }
      },
      delete: {
        summary: 'Unregister logged-in user from an event',
        tags: ['Registrations'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Unregistered successfully' },
          404: { description: 'Registration not found' }
        }
      }
    },
    '/api/events/{id}/attendees': {
      get: {
        summary: 'Get list of registered attendees for an event',
        tags: ['Registrations'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Attendee list retrieved' },
          404: { description: 'Event not found' }
        }
      }
    },
    '/api/events/{id}/announcements': {
      post: {
        summary: 'Broadcast real-time announcement to event attendees (Admin only)',
        tags: ['Announcements'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: { type: 'string', example: 'Event starts in 30 minutes!' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Announcement broadcasted successfully' },
          403: { description: 'Forbidden' },
          404: { description: 'Event not found' }
        }
      }
    }
  }
};

export const serveSwagger = swaggerUi.serve;
export const setupSwagger = swaggerUi.setup(swaggerDocument);
