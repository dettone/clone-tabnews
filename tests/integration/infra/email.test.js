import email from "infra/email";
import orchestrator from "tests/orchestrator";
beforeAll(async () => {
  await orchestrator.waitForAllServices();
});
describe("infra/email.js", () => {
  test("send", async () => {
    await orchestrator.deleteAllEmails();
    await email.send({
      from: "FinTab <contato@fintab.com.br>",
      to: "contato@curso.dev",
      subject: "Teste de assunto",
      text: "Teste de corpo.",
    });

    await email.send({
      from: "FinTab <contato@fintab.com.br>",
      to: "contato@curso.dev",
      subject: "Ultimo assunto",
      text: "Teste de corpo ultimo.",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.text).toBe("Teste de corpo ultimo.\n");
    expect(lastEmail.subject).toBe("Ultimo assunto");
    expect(lastEmail.recipients[0]).toBe("<contato@curso.dev>");
    expect(lastEmail.sender).toBe("<contato@fintab.com.br>");
  });
});
