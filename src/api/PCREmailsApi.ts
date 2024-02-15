export const checkSBAPCRValid = (pcrEmail: string | undefined) => {
  if (pcrEmail === undefined || pcrEmail === "") {
    return "You must provide an Email for SBA PCR if sending to that stage";
  } else if (
    // Check that the value matches email address format, and ends in .gov or .mil
    // Based on https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch04s01.html
    !/^[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@(?:[A-Z0-9-]+\.)+(gov|mil)$/i.test(
      pcrEmail
    )
    //!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*((\.gov)|(\.mil))$/.test(
    //  pcrEmail.toLowerCase()
    //)
  ) {
    return "SBA PCR Emai address is not a valid .gov or .mil address";
  } else {
    return undefined;
  }
};
