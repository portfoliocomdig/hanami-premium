# Documentação de CRUD — Produtos e Pedidos

Todas as rotas abaixo estão prefixadas por `/api`. Rotas marcadas com 🔒 exigem
header `Authorization: Bearer <token>`. Rotas marcadas com 👑 exigem, além do
token, que o usuário tenha `role: admin`.

## 1. Produtos (`/api/products`)

| Método | Rota | Payload (entrada) | Resposta (sucesso) | Descrição funcional |
|---|---|---|---|---|
| GET | `/api/products` | Query params opcionais: `?category=sushi&sort=price_asc\|price_desc\|name&featured=true&search=salmão` | `200 { success, count, products: [{ id, name, description, category, price, stock, featured, imageUrl, active }] }` | Lista o cardápio com filtro por categoria/destaque/busca textual e ordenação por preço ou nome. Só retorna produtos `active: true`. |
| GET | `/api/products/:id` | — | `200 { success, product }` / `404` | Detalha um produto específico. |
| POST | `/api/products` 🔒👑 | `{ name, description?, category, price, stock, featured?, imageUrl? }` | `201 { success, product }` / `422` (validação) | Cria um novo prato no cardápio. `category` deve ser uma das 8 categorias válidas; `price` > 0; `stock` >= 0. |
| PUT | `/api/products/:id` 🔒👑 | Qualquer subconjunto de `{ name, description, category, price, stock, featured, imageUrl, active }` | `200 { success, product }` / `404` / `422` | Atualiza parcialmente um produto (ex.: apenas `price` e `stock`, como no exemplo do enunciado). |
| DELETE | `/api/products/:id` 🔒👑 | — | `200 { success, message }` / `404` | Remove o produto do cardápio público. É um **soft-delete** (`active = false`): o histórico de pedidos que já usaram esse produto continua íntegro. |

### Regras de validação (produtos)
- `category` só aceita: `sushi, sashimi, chuukaman, temaki, nigiri, quentes, entradas, sobremesas`.
- `price`: número decimal positivo (mín. `0.01`).
- `stock`: inteiro `>= 0`.
- Erros de validação retornam `422` com `{ errors: [{ campo, mensagem }] }`.

## 2. Pedidos (`/api/orders`) — todas as rotas exigem login 🔒

| Método | Rota | Payload (entrada) | Resposta (sucesso) | Descrição funcional |
|---|---|---|---|---|
| POST | `/api/orders` 🔒 | `{ items: [{ productId, quantity }], paymentMethod: "credit_card"\|"pix", deliveryAddress: { street, number, complement?, neighborhood?, city, state, postalCode }, card?: { encrypted, holderName }, installments? }` | `201 { success, order, pagbank }` | Cria o pedido, valida estoque/preço no servidor (nunca confia no preço enviado pelo cliente), debita estoque, e **cria e paga o pedido no PagBank** na mesma requisição. Para `pix`, a resposta inclui `order.pixQrCode` (código copia-e-cola). Tudo roda em uma transação: se o PagBank recusar, nada é persistido. |
| GET | `/api/orders` 🔒 | Query opcional `?all=true` (somente admin, lista de todos os usuários) | `200 { success, count, orders }` | Lista os pedidos do usuário autenticado (ou todos, se admin). |
| GET | `/api/orders/:id` 🔒 | — | `200 { success, order }` / `403` / `404` | Detalha um pedido, incluindo itens. Usuário comum só acessa os próprios pedidos. |
| PATCH | `/api/orders/:id/status` 🔒👑 | `{ status: "pending"\|"paid"\|"preparing"\|"delivering"\|"delivered"\|"cancelled"\|"refunded" }` | `200 { success, order }` / `404` | Atualiza o status operacional do pedido (ex.: cozinha marca "preparing", entregador marca "delivering"). |
| DELETE | `/api/orders/:id` 🔒 | — | `200 { success, message }` / `403` / `404` / `409` | Cancela um pedido ainda `pending` ou `paid` (dono do pedido ou admin). Pedidos já `delivered`/`cancelled` não podem ser cancelados de novo. |

### Regras de validação (pedidos)
- `items` deve ter ao menos 1 item; cada `productId` deve existir; `quantity >= 1`.
- `deliveryAddress.postalCode` deve seguir o padrão `00000-000` ou `00000000`.
- Se `paymentMethod = "credit_card"`, `card.encrypted` e `card.holderName` são obrigatórios (o número de cartão em si **nunca** é enviado ao back-end — veja `docs/ARQUITETURA.md`, seção 5.4).
- `installments`, quando enviado, deve ser um inteiro entre 1 e 12.

## 3. Pagamentos (`/api/payments`)

| Método | Rota | Payload (entrada) | Resposta | Descrição funcional |
|---|---|---|---|---|
| POST | `/api/payments/webhook` | Payload enviado pelo PagBank (notificação de mudança de status de charge/pedido) | `200 { success }` | Endpoint público chamado pelo PagBank. Ao receber a notificação, o back-end consulta o status oficial do pedido diretamente na API do PagBank (nunca confia cegamente no corpo do webhook) e atualiza o `status` do pedido local. |

## 4. Autenticação (`/api/auth`) — necessária para as rotas de pedidos

| Método | Rota | Payload | Resposta | Descrição |
|---|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password, phone?, taxId? }` | `201 { success, token, user }` | Cria conta. Senha é armazenada com hash bcrypt (nunca em texto puro). `taxId` (CPF) é usado depois como `customer.tax_id` na cobrança do PagBank. |
| POST | `/api/auth/login` | `{ email, password }` | `200 { success, token, user }` / `401` | Autentica e retorna um JWT válido por `JWT_EXPIRES_IN` (padrão 1 dia). |
| GET | `/api/auth/me` 🔒 | — | `200 { success, user }` | Retorna os dados do usuário autenticado (a partir do token). |
