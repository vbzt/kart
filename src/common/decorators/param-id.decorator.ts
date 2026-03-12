import { BadRequestException, createParamDecorator, ExecutionContext } from "@nestjs/common";

export const ParamId = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest();
  const id = req.params.id as string | undefined;

  if (!id) {
    throw new BadRequestException('Parâmetro "id" é obrigatório.');
  }

  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidV4Regex.test(id)) {
    throw new BadRequestException('Parâmetro "id" deve ser um UUID v4 válido.');
  }

  return id;
})