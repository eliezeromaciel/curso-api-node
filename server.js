import express from 'express'
import bodyParser from 'body-parser'
import con from './connect-db.js'
// import listarDepartamentosMOCK from './mock/listarDepartamentoMOCK.json' assert {type: 'json'}

import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUI from 'swagger-ui-express'

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


// configuração mínima para uso do SWAGGER
const options = {
  definition: {
    info: {
      title: 'API NODE JS',
      version: '1.0.0'
    }
  },
  apis: ['server.js']
}
// especificacoes , chamando 
const swaggerSpec = swaggerJSDoc(options)
// criar rota para swagger ler nossa interface
// configurar minah api para usar o middwaler swagger pq tudo q for requisicao , todas as interpretacoes de rotas deverao passar também pelo swagger. 
app.use('/swagger-ui', swaggerUI.serve, swaggerUI.setup(swaggerSpec))

const useMock = false

/**
 * @swagger
 * 
 * /departamentos:
 *  get:
 *    description: lista todos os departamentos, ordenados pelo ID.
 *    produces: 
 *      - application/json
 *    responses: 
 *      200:
 *        description: exibe todos os departamentos, em um vetor.
 */
app.get('/departamentos', (req, res) => {
  const method = req.method
  console.log(`${method} /departamentos`)

  if (useMock) {
    res.send('listarDepartamentosMOCK')
    return  // PRECISO USAR O RETURN, PARA NAO DAR ERRO (A PARTIR DA VERSAO XXX DO NODE)
  }

  con.query('SELECT * FROM DEPARTAMENTOS ORDER BY id_departamento', (err, result) => {
    if (err) {
      res.status(500)
      res.send(err)
    }
    res.send(result)
  })
})

/**
 * @swagger
 * 
 * /departamentos:
 *  get:
 *    description: lista um departamento pelo seu ID.
 *    produces: 
 *      - application/json
 *    responses: 
 *      200:
 *        description: exibe apenas um departamento, pelo parâmetro ID.
 */
app.get('/departamento/:idDepartamento', (req, res) => {
  const { idDepartamento } = req.params
  const method = req.method
  console.log(`${method} /departamento/${idDepartamento}`)

  if (useMock) {
    res.send('listarDepartamentosMOCK')
    return  
  }
  con.query(`SELECT * FROM DEPARTAMENTOS WHERE id_departamento='${idDepartamento}'`, (err, result) => {
    if (err) {
      res.status(500)
      res.send(err)
    }
    res.send(result)
  })
})



/**
 * @swagger
 * 
 * /departamentos:
 *  post:
 *    description: Insere um departamento na base
 *    produces:
 *      - application/json
 *    parameters:
 *      - in: formData
 *        name: nome
 *        description: nome do departamento (unique)
 *        required: true
 *        type: string
 *      - in: formData
 *        name: sigla
 *        description: sigla do departamento (unique)
 *        type: string 
 *    responses:
 *      200:
 *        description: registro inserido com sucesso
 *      500:
 *        description: erro do banco de dados
 */
app.post('/departamentos', (req, res) => {
  const method = req.method
  console.log(`${method} /departamentos`)

  if (useMock) {
    res.send('listarDepartamentoMOCK sei la lkalj;lkjaohaiu')
    return  
  }

  let { nome = '', sigla = '' } = req.body
  
  nome = nome.trim()
  sigla = sigla.trim()
  
  if (nome === '' || sigla === '') {
    res.send({
      message: 'Wrong or insufficient parameters',
      parameters_received: req.body
    })
    return 
  }
  
  con.query(`INSERT INTO DEPARTAMENTOS (nome, sigla) VALUES ('${nome}', '${sigla}')`, (err, result) => {
    if (err) {
      res.status(500)
      res.send(err)
      return
    }
  
    //Em caso de sucesso:
    if (result.insertId) {
      res.send({
        message: 'Register inserted with success',
        insertId: result.insertId
      })  
      return
    }
    res.send(result)
  })
})


/**
 * @swagger
 * 
 * /departamento/{idDepartamento}:
 *  put:
 *    description: Atualiza um departamento na base de dados com base no ID do departamento especificado na URL.
 *    produces:
 *      - application/json
 *    parameters:
 *      - in: path
 *        name: idDepartamento
 *        description: ID do departamento a ser atualizado.
 *        required: true
 *        type: integer
 *      - in: body
 *        name: body
 *        description: Objeto JSON com as informações do departamento a serem atualizadas.
 *        required: true
 *        schema:
 *          type: object
 *          properties:
 *            nome:
 *              type: string
 *              description: Nome do departamento
 *            sigla:
 *              type: string
 *              description: Sigla do departamento.
 *    responses:
 *      200:
 *        description: Departamento atualizado com sucesso.
 *        schema:
 *          type: object
 *          properties:
 *            message:
 *              type: string
 *              example: Departamento atualizado com sucesso.
 *      400:
 *        description: Requisição inválida.
 *        schema:
 *          type: object
 *          properties:
 *            message:
 *              type: string
 *              example: register not modified.
 *      500:
 *        description: Erro de banco de dados.
 */
app.put('/departamento/:idDepartamento', (req, res) => {
  const { idDepartamento } = req.params
  const { nome, sigla } = req.body
    
  if (nome && sigla) {
    con.query(`UPDATE DEPARTAMENTOS SET nome='${nome}', sigla='${sigla}' WHERE id_departamento='${idDepartamento}'`, (err, result) => {
      if (err) {
        res.status(500)
        res.send(err)
      }
          
      if (result.changedRows ==! 0) {
        res.send({
          message: 'NOME e SIGLA modified with success',
        })
      }
      else {res.send({
        message: 'register not modified'
      })}
    })
    return
  }

  if (nome){
    con.query(`UPDATE DEPARTAMENTOS SET nome='${nome}' WHERE id_departamento='${idDepartamento}'`, (err, result) => {
      if (err) {
        res.status(500)
        res.send(err)
      }
    
      if (result.changedRows ==! 0) {
        res.status(200)
        res.send({
          message: 'NOME modified with success',
        })
      }
      else {
        res.status(400)
        res.send({
          message: 'register not modified'
        })}
    })
    return
  }

  if (sigla){
    con.query(`UPDATE DEPARTAMENTOS SET sigla='${sigla}' WHERE id_departamento='${idDepartamento}'`, (err, result) => {
      if (err) {
        res.status(500)
        res.send(err)
      }
      
      if (result.changedRows ==! 0) {
        res.send({
          message: 'SIGLA modified with success',
        })
      }
      else {res.send({
        message: 'register not modified'
      })}
    })
    return
  }
})
  



/**
 * @swagger
 * 
 * /departamento/{idDepartamento}:
 *  delete:
 *    description: deleta um departamento na base de dados com base no ID do departamento especificado na URL.
 *    produces:
 *      - application/json
 *    parameters:
 *      - in: path
 *        name: idDepartamento
 *        description: ID do departamento a ser deletado.
 *        required: true
 *        type: integer
 *    responses:
 *      200:
 *        description: Departamento deletado com sucesso.
 *        schema:
 *          type: object
 *          properties:
 *            message:
 *              type: string
 *              example: DEPTO deleted with success.
 *      400:
 *        description: Requisição inválida.
 *        schema:
 *          type: object
 *          properties:
 *            message:
 *              type: string
 *              example: Deleted not executed.
 *      500:
 *        description: Erro de banco de dados.
 */
app.delete('/departamento/:idDepartamento',  (req, res) => {
  const { idDepartamento } = req.params
  const method = req.method
  console.log(`${method} /departamento/${idDepartamento}`)


  con.query(`DELETE FROM DEPARTAMENTOS WHERE id_departamento='${idDepartamento}'`, (err, result) => {
    if (err) {
      res.status(500)
      res.send(err)
    }
    
    if (result.affectedRows ==! 0) {
      res.status(200)
      res.send({
        message: 'DEPTO deleted with success',
      })
    }
    else {
      res.status(400)
      res.send({      
        message: 'Deleted not executed'
      })
    }
  })
  return
})




// exemplo utilizando diversos formatos de parametros (feitos por mim)
// app.get('/funcionarios:busca', (req, res) => {
//   const {busca} = req.params
  
//   con.query(`SELECT * FROM FUNCIONARIOS WHERE nome LIKE '%${busca}%' `, (err, result) => {
//     if (err) {
//       res.send(err)
//     }
//     res.send(result)
//   })
// })


// Exemplo utilizando diversos formatos de parametros professor
app.get('/funcionarios/:busca', (req, res) => {
  const { busca } = req.params
  const { exact, searchField } = req.body
  const strLike = exact ? `= '${busca}'` : `LIKE '%${busca}%'`
  const query = `SELECT * FROM FUNCIONARIOS WHERE ${searchField} ${strLike}`

  console.log(query)

  con.query(query, (err, result) => {
    if (err) {
      res.send(err)
    }
    res.send(result)
  })
})


app.listen(3033, () => {
  console.log('Server is running!')
})