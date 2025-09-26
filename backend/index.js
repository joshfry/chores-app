/**
 * Server Entry Point
 * Starts the Express server with proper error handling
 */

const app = require('./app')
const config = require('./config/server')

// Graceful error handling
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message)
  console.error('📊 Stack:', err.stack)
  console.error('🔍 Details:', err)
  // In development, don't exit immediately to help debugging
  if (config.env === 'production') {
    process.exit(1)
  } else {
    console.error('⚠️  Server continuing in development mode...')
  }
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Promise Rejection at:', promise)
  console.error('📊 Reason:', reason)
  console.error('🔍 Stack:', reason?.stack || 'No stack available')
  // Don't exit in development for better debugging
  if (config.env === 'production') {
    process.exit(1)
  } else {
    console.error('⚠️  Server continuing in development mode...')
  }
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Graceful shutdown initiated...')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})

// Start server with better error handling
let server
try {
  server = app.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`)
    console.log(`🏥 Health check: http://localhost:${config.port}/health`)
    console.log(`🌍 Environment: ${config.env}`)
    console.log(`📝 Press Ctrl+C to stop the server`)
    console.log(`⚙️  Process ID: ${process.pid}`)
  })

  // Handle server errors
  server.on('error', (err) => {
    console.error('❌ Server error:', err.code || err.message)
    if (err.code === 'EADDRINUSE') {
      console.error(`💡 Port ${config.port} is already in use!`)
      console.error(`🔧 Try these solutions:`)
      console.error(`   • pkill -f "node index.js"`)
      console.error(`   • pkill -f "nodemon"`)
      console.error(`   • lsof -ti:${config.port} | xargs kill -9`)
      console.error(`   • Change PORT environment variable`)
    }

    // Give some time for cleanup before exit
    setTimeout(() => {
      process.exit(1)
    }, 100)
  })

  // Handle connection errors
  server.on('clientError', (err, socket) => {
    console.error('🔌 Client connection error:', err.message)
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
  })
} catch (err) {
  console.error('💥 Failed to start server:', err)
  process.exit(1)
}
