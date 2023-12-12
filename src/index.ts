import express, { Request, Response } from "express";
import cors from "cors";
import { accounts } from "./database";
import { ACCOUNT_TYPE } from "./types";

const app = express();

app.use(express.json());
app.use(cors());

app.listen(3003, () => {
  console.log("Servidor rodando na porta 3003");
});

app.get("/ping", (req: Request, res: Response) => {
  res.send("Pong!");
});

//------------------------------------------------------------
// Endpoint getAccountById

app.get("/accounts", (req: Request, res: Response) => {
  res.send(accounts);
});

//------------------------------------------------------------
// Endpoint getAccountById

app.get("/accounts/:id", (req: Request, res: Response) => {
  try {
    const id = req.params.id; // params não precisa ser tipado pois sempre é uma string por padrão

    const result = accounts.find((account) => account.id === id); // no array accounts está procurando uma id que seja igual ao id que recebemos por params (linha 31)

    if (!result) {
      //se o resultado não existir, manda a reposta de erro 404
      res.status(404); // res.statusCode = 404 -> outra forma de fazer essa sintaxe
      throw new Error("Conta não encontrada. Verifique a 'id'"); //joga o resultado lá para o catch
    }

    res.status(200).send(result); // Caminho feliz! Se o resultado existir, não vai entrar no if (linha 33). Dá que o resultado é 200 (deu tudo certo)
  } catch (error) {
    // recebe o erro detectado acima
    // console.log(error);
    if (res.statusCode === 200) {
      // se acima der resultado o status 200 (que não deu erro), como ele vai ser pego no catch, tem que alterar de 200 para 500
      res.status(500); //erro inesperado
    }

    if (error instanceof Error) { //se der o erro 404
      res.send(error.message); // manda a mensagem da linha 38
    } else { // senão for uma instância do erro 404, manda
      res.send("Erro inesperado"); // a mensagem do erro 500
    }
  }
});

//------------------------------------------------------------
// Endpoint deleteAccount - Verificar se a id começa com a letra 'a'

app.delete("/accounts/:id", (req: Request, res: Response) => {
  try {
    const id = req.params.id; // params não precisa ser tipado pois sempre é uma string por padrão

    if (id[0] !== "a") { // Verificar se o id começa com a letra 'a' antes de fazer qualquer coisa com essa informação. Se o id vier errado, não roda o código à toa
      res.status(400);
      throw new Error("'id' inválido. Deve iniciar com a letra 'a'");
    }
    // OUTRA MANEIRA DE FAZER:
    // if (!id.startsWith("a")) ...

    const accountIndex = accounts.findIndex((account) => account.id === id); // no array accounts está procurando uma id que seja igual ao id que recebemos por params (linha 61) para encontrar o índice desse id

    if (accountIndex >= 0) { // se o índice encontrado for maior ou igual a zero,
      accounts.splice(accountIndex, 1); //um único índice é retirado do array, ou seja é deletado
    }

    res.status(200).send("Item deletado com sucesso");
  } catch (error) { // recebe o erro detectado acima
    if (res.statusCode === 200) { // se acima der resultado o status 200 (que não deu erro), como ele vai ser pego no catch, tem que alterar de 200 para 500
      res.status(500); //erro inesperado
    }

    if (error instanceof Error) { //se der o erro 400
      res.send(error.message); // manda a mensagem da linha 67
    } else { // senão for uma instância do erro 400, manda
      res.send("Erro inesperado"); // a mensagem do erro 500
    }
  }
});

//--------------------------------------------------------
// Endpoint editAccount

app.put("/accounts/:id", (req: Request, res: Response) => {
    try{
        const id = req.params.id; // params não precisa ser tipado pois sempre é uma string por padrão

        const newId = req.body.id as string | undefined;
        const newOwnerName = req.body.ownerName as string | undefined;
        const newBalance = req.body.balance as number | undefined;
        const newType = req.body.type as ACCOUNT_TYPE | undefined;
      
        if (newBalance !== undefined) { //se newBalence não for undefined, verificar:
            if (typeof newBalance !== "number") { // se não for um number, gera o erro abaixo
                res.status(400)
                throw new Error("'balance' deve ser do tipo number.")
            }
            if (newBalance < 0) { // se for um valor negativo, gera o erro abaixo
                res.status(400)
                throw new Error("'balance' deve ter valor maior ou igual a zero.")
            }
        }

        if (newType !== undefined) {  //se newType não for undefined, verificar:
            if (newType !== ACCOUNT_TYPE.GOLD && newType !== ACCOUNT_TYPE.BLACK && newType !== ACCOUNT_TYPE.PLATINUM) {
                res.status(400)
                throw new Error("'type' deve ser um tipo válido: Ouro, Platina ou Black.")
            }
        }

        if (newId !== undefined) {
            if (typeof newId !== "string") { // Verificar se o id começa com a letra 'a' antes de fazer qualquer coisa com essa informação. Se o id vier errado, não roda o código à toa
                res.status(400);
                throw new Error("'id' deve ser do tipo string");
            }
            if (!newId.startsWith("a")) { // Verificar se o id começa com a letra 'a' antes de fazer qualquer coisa com essa informação. Se o id vier errado, não roda o código à toa
                res.status(400);
                throw new Error("'id' inválido. Deve iniciar com a letra 'a'");
            }
        }
        
        if (newOwnerName !== undefined) { 
            if (typeof newOwnerName !== "string") { // Verificar se o id começa com a letra 'a' antes de fazer qualquer coisa com essa informação. Se o id vier errado, não roda o código à toa
                res.status(400);
                throw new Error("'ownerName' deve ser do tipo string");
            }
            if (newOwnerName.length < 2) { // Verificar se o nome tem no mínimo 2 caracteres
                res.status(400);
                throw new Error("'ownerName' inválido. Deve ter no mínimo 2 caracteres");
            }
        }

        const account = accounts.find((account) => account.id === id);
      
        if (account) {
          account.id = newId || account.id;
          account.ownerName = newOwnerName || account.ownerName;
          account.type = newType || account.type;
      
          account.balance = isNaN(newBalance) ? account.balance : newBalance;
        }
      
        res.status(200).send("Atualização realizada com sucesso");
    }
    catch(error){ // recebe o erro detectado acima
        if (res.statusCode === 200) { // se acima der resultado o status 200 (que não deu erro), como ele vai ser pego no catch, tem que alterar de 200 para 500
            res.status(500); //erro inesperado
          }
      
          if (error instanceof Error) { //se der o erro 400
            res.send(error.message); // manda a mensagem das linhas 107 ou 111
          } else { // senão for uma instância do erro 400, manda
            res.send("Erro inesperado"); // a mensagem do erro 500
          }
    }
});
