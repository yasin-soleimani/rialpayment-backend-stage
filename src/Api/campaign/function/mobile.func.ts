export function mobileNoValidator(input) {
  const regex = /^(((98)|(\+98)|(0098)|0)(90|91|92|93|94|99){1}[0-9]{8})+$/;

  if (regex.test(input)) {
    return true;
  } else {
    return false;
  }

}