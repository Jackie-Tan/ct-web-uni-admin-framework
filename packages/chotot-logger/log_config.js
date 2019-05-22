let LOG_HOST, LOG_PORT;

export default function(category) {
  switch (process.env.LOG_ENV) {
    case 'development':
      LOG_HOST = process.env.LOG_HOST || '10.60.6.15'
      LOG_PORT = process.env.LOG_PORT || '12222'
      switch (category) {
        case 'info':
          return {
            type: 'gelf',
            host: LOG_HOST,
            port: LOG_PORT,
            category: 'info'
          };
        case 'error':
          return {
            type: 'gelf',
            host: LOG_HOST,
            port: LOG_PORT,
            category: 'error'
          };
        default:
          return {
            type: 'gelf',
            host: LOG_HOST,
            port: LOG_PORT,
            category: category
          };
      }
    case 'staging':
      LOG_HOST = process.env.LOG_HOST || '10.60.6.15'
      LOG_PORT = process.env.LOG_PORT || '12222'
      switch (category) {
        case 'info':
          return {
            type: 'console'
          };
        case 'error':
          return {
            type: 'console'
          };
        default:
          return {
            type: 'console'
          };
      }
    default:
      LOG_HOST = process.env.LOG_HOST || '10.50.6.15'
      LOG_PORT = process.env.LOG_PORT || '12222'
      switch (category) {
        case 'info':
          return {
            type: 'gelf',
            host: LOG_HOST,
            port: LOG_PORT,
            category: 'info'
          };
        case 'error':
          return {
            type: 'gelf',
            host: LOG_HOST,
            port: LOG_PORT,
            category: 'error'
          };
        default:
          return {
            type: 'gelf',
            host: LOG_HOST,
            port: LOG_PORT,
            category: category
          };
      };
  }
}
