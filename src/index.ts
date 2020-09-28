import express, { Request, Response } from 'express'
import path from 'path'
import redis from 'redis'

const app = express()
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: +process.env.REDIS_PORT! || 6379,
})
const REDIS_DEFAULT_EXPIRY = 10

app.use(express.urlencoded())

app.set('views', path.join(__dirname, '..', 'views'))
app.set('view engine', 'ejs')

app.get('/', (_: Request, res: Response) => {
  client.get('items', (_, reply) => {
    if (!reply) {
      res.render('pages/home', {
        items: [],
      })
    } else {
      const items = JSON.parse(reply)
      res.render('pages/home', {
        items,
      })
    }
  })
})

app.post('/', (req: Request, res: Response) => {
  if (req.body.item !== '') {
    client.get('items', (_, reply) => {
      if (!reply) {
        const items = []
        items.push(req.body.item)

        client.set('items', JSON.stringify(items), () => {
          client.expire('items', REDIS_DEFAULT_EXPIRY)
          res.redirect('/')
        })
      } else {
        const items = JSON.parse(reply)
        items.push(req.body.item)

        client.set('items', JSON.stringify(items), () => {
          client.expire('items', REDIS_DEFAULT_EXPIRY)
          res.redirect('/')
        })
      }
    })
  } else {
    res.redirect('/')
  }
})

app.listen(process.env.PORT || 3000, () => {
  console.log('App is running...')
})
