const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VIMAANNA DGCA Learning Platform API',
      version: '1.0.0',
      description: 'A comprehensive API for the VIMAANNA DGCA learning platform, providing authentication, question management, practice tests, and AI-powered learning features.',
      contact: {
        name: 'VIMAANNA Support',
        email: 'support@vimaanna.com',
        url: 'https://vimaanna.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.vimaanna.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/auth/login'
        },
        csrf: {
          type: 'apiKey',
          in: 'header',
          name: 'X-CSRF-Token',
          description: 'CSRF token for form submissions'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique user identifier',
              example: '507f1f77bcf86cd799439011'
            },
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 50,
              pattern: '^[a-zA-Z0-9_]+$',
              description: 'Unique username',
              example: 'john_doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john@example.com'
            },
            isAdmin: {
              type: 'boolean',
              description: 'Whether user has admin privileges',
              example: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp'
            }
          }
        },
        Question: {
          type: 'object',
          required: ['subject', 'book', 'text', 'options', 'answer'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique question identifier',
              example: '507f1f77bcf86cd799439011'
            },
            subject: {
              type: 'string',
              description: 'Subject ID reference',
              example: '507f1f77bcf86cd799439011'
            },
            book: {
              type: 'string',
              description: 'Book ID reference',
              example: '507f1f77bcf86cd799439011'
            },
            text: {
              type: 'string',
              maxLength: 5000,
              description: 'Question text',
              example: 'What is the minimum visibility required for VFR flight?'
            },
            options: {
              type: 'array',
              items: {
                type: 'string'
              },
              minItems: 2,
              maxItems: 10,
              description: 'Answer options',
              example: ['A) 1 mile', 'B) 3 miles', 'C) 5 miles', 'D) Clear of clouds']
            },
            answer: {
              type: 'string',
              description: 'Correct answer',
              example: 'B) 3 miles'
            },
            explanation: {
              type: 'string',
              maxLength: 5000,
              description: 'Explanation for the correct answer',
              example: 'VFR flight requires minimum 3 miles visibility'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Question creation timestamp'
            }
          }
        },
        Result: {
          type: 'object',
          required: ['user', 'score', 'total', 'answers'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique result identifier',
              example: '507f1f77bcf86cd799439011'
            },
            user: {
              type: 'string',
              description: 'User ID reference',
              example: '507f1f77bcf86cd799439011'
            },
            testType: {
              type: 'string',
              enum: ['book', 'admin', 'ai'],
              description: 'Type of test taken',
              example: 'ai'
            },
            subjectName: {
              type: 'string',
              description: 'Subject name (for AI tests)',
              example: 'Air Regulations'
            },
            bookName: {
              type: 'string',
              description: 'Book name (for AI tests)',
              example: 'IC Joshi'
            },
            chapterName: {
              type: 'string',
              description: 'Chapter name (for AI tests)',
              example: 'Licensing'
            },
            score: {
              type: 'number',
              minimum: 0,
              description: 'Number of correct answers',
              example: 8
            },
            total: {
              type: 'number',
              minimum: 1,
              description: 'Total number of questions',
              example: 10
            },
            timeSpent: {
              type: 'number',
              minimum: 0,
              description: 'Time spent in seconds',
              example: 300
            },
            difficulty: {
              type: 'string',
              enum: ['easy', 'medium', 'hard', 'adaptive'],
              description: 'Test difficulty level',
              example: 'medium'
            },
            answers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  questionText: {
                    type: 'string',
                    description: 'Question text'
                  },
                  selected: {
                    type: 'string',
                    description: 'Selected answer'
                  },
                  correct: {
                    type: 'boolean',
                    description: 'Whether answer is correct'
                  },
                  explanation: {
                    type: 'string',
                    description: 'Explanation for the answer'
                  }
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Result creation timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Validation failed'
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Detailed error messages',
              example: ['Password must be at least 8 characters long']
            },
            field: {
              type: 'string',
              description: 'Field that caused the error',
              example: 'password'
            }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              description: 'Array of items'
            },
            total: {
              type: 'number',
              description: 'Total number of items',
              example: 100
            },
            page: {
              type: 'number',
              description: 'Current page number',
              example: 1
            },
            pages: {
              type: 'number',
              description: 'Total number of pages',
              example: 10
            },
            cached: {
              type: 'boolean',
              description: 'Whether response was served from cache',
              example: false
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './index.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
