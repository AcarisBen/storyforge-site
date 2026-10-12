# storyforge-site
Seu estúdio profissional de desenvolvimento narrativo. Da primeira ideia à Story Bible completa.

## Backend local

Copie `backend/.env.example` para `backend/.env`, preencha o banco, SMTP e segredos locais e então execute:

```sh
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm start
```

Na implantação, use segredos próprios fora do repositório; `JWT_SECRET` e `STFG_SECRET_KEY` devem ter pelo menos 32 caracteres aleatórios. Configure `FRONTEND_URL` como a origem HTTPS exata e `TRUST_PROXY_HOPS` para o número real de proxies reversos entre a internet e o Express. Não use um número de saltos que varie entre caminhos de rede. `COOKIE_SAME_SITE=strict` é o padrão recomendado; `none` exige HTTPS e pode ser bloqueado por políticas de cookies de terceiros, portanto prefira hospedar frontend e API no mesmo site.

Configure SMTP (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`) em produção. Configure `REDIS_URL` quando o backend tiver várias instâncias para que os limites de requisição sejam compartilhados; sem Redis o rate limiting usa memória local.
