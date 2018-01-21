const _          = require('underscore')
const express    = require('express')
const multer     = require('multer')
const path       = require('path')
const upload     = multer( { dest: 'uploads/' } )
const { spawn }  = require('child_process')

const app     = express()
const server  = {
  protocol: 'http',
  location: 'localhost',
  port:     3000
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/upload', (req, res) => {
  res.sendFile(__dirname + '/upload.html')
})

app.post('/upload', upload.single('leFile'), (req, res) => {
  if(!req.file) return res.json( { error: 'need file...' } )
  if(!req.file.mimetype === 'audio/mp3') return res.json( { error: 'need mp3...' } )


  const extension    = _.last( req.file.originalname.split('.') )
  const uploadedFile = `${__dirname}/${req.file.path}`
  const outputDir    = `${__dirname}/output`
  const outputFile   = `${outputDir}/${req.file.filename}.${extension}`

  const args         = [ '-i', uploadedFile, outputFile]

  const ffmpeg = spawn('ffmpeg', args)

  console.log("Starting file processing!", ffmpeg.spawnargs)

  ffmpeg.stderr.on('data', (data) => {
    console.error(data.toString())
  })

  ffmpeg.stdout.on('data', (data) => {
    console.error(data.toString())
  })

  ffmpeg.on('close', (closeCode) => {
    if(closeCode !== 0) return res.json( { error: 'ffmpeg error' } )
    console.log("finished processing file! : )")

    res.json( { link: `${server.protocol}://${server.location}:${server.port}/${req.file.filename}.${extension}` } )
  })
})

app.use(express.static(path.join(`${__dirname}/output`)))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json( { error: "Ah, kapot..." } )
})

app.listen(server.port, () => {
  console.log(`Listening at port ${server.port}`)
})
