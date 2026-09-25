# ORÇAH CONTROL — Auditoria Asaas

## 1. Como o ORÇAH cria cliente no Asaas

O produto principal cria ou localiza um customer no Asaas quando o usuário inicia uma cobrança. O fluxo busca por `externalReference` e, se não encontra um customer existente, cria um novo cliente no Asaas.

## 2. CPF/CNPJ

O CPF/CNPJ enviado ao Asaas vem do dado digitado no fluxo de cobrança do ORÇAH. No Control, CPF/CNPJ é exibido mascarado por padrão.

## 3. externalReference = companyId

O ORÇAH usa:

```text
externalReference = companyId
```

O Control cruza esse valor com `companies.id` para identificar a empresa ORÇAH correspondente.

## 4. Excluir Supabase não exclui Asaas

Apagar usuário ou empresa no Supabase/PostgreSQL não apaga automaticamente customer, assinatura ou pagamento no Asaas. A primeira versão do Control apenas monitora divergências.

## 5. Sandbox x Produção

O ambiente é detectado por `ASAAS_API_URL`:

- URL contendo `sandbox`: `SANDBOX`;
- outra URL configurada: `PRODUCAO`;
- URL ausente: `NAO_CONFIGURADO`.

Recomendação: nunca usar chave Production em Preview.

## 6. Como identificar cliente originado do ORÇAH

Um cliente Asaas é considerado vinculado ao ORÇAH quando:

1. `externalReference` existe;
2. `externalReference` é numérico;
3. existe empresa local com `companies.id` igual ao valor.

Sem correspondência, o painel mostra `Sem vínculo identificado com ORÇAH`.

## 7. Riscos

- Customers antigos ou externos podem não ter `externalReference`.
- `externalReference` não numérico não deve ser associado automaticamente.
- Ambiente Production precisa de indicação visual forte para evitar confusão operacional.
- Divergências entre Supabase e Asaas exigem revisão humana antes de qualquer ação.

## 8. Garantia read-only

O Control não cria, edita, cancela nem remove nada no Asaas. A integração Asaas usa somente `GET`.
