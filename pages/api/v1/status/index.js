function status(request, response) {
  return response.status(200).send({
    message: "tabnews online!",
  });
}

export default status;
