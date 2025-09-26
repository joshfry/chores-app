/**
 * Server Entry Point
 * Starts the Express server
 */

const app = require('./app')
const config = require('./config/server')

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`)
  console.log(`🏥 Health check: http://localhost:${config.port}/health`)
  console.log(`🌍 Environment: ${config.env}`)
})
