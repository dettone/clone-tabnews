import { createRouter } from "next-connect";
import * as cookie from "cookie";
import controller from "infra/controller.js";
import session from "models/session.js";
import authentication from "models/authentication.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandles);

async function postHandler(request, response) {
  const userInputValues = request.body;

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  const newSession = await session.create(authenticatedUser.id);

  const setCookie = cookie.serialize("session_id", newSession.token, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
  });

  response.setHeader("Set-Cookie", setCookie);

  return response.status(201).json(newSession);
}
