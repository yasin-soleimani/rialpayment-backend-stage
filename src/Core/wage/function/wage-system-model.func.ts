export function setWageSystemModel(
  total,
  type,
  wage,
  merchantinfo,
  agentid,
  merchantid,
  userid,
  createdAt?,
  updatedAt?
) {
  return {
    total: total,
    type: type,
    wage: wage,
    merchantinfo: merchantinfo,
    agent: agentid,
    merchant: merchantid,
    user: userid,
    createdAt: createdAt,
    updatedAt: updatedAt,
  };
}

export function setWageSystemWageModel(total, company, agent, merchant, type, wagenumber) {
  return {
    total: total,
    company: company,
    agent: agent,
    merchant: merchant,
    type: type,
    wagenumber: wagenumber,
  };
}

export function setWageSystemTerminalModel(acceptorid, terminalid, type) {
  return {
    acceptor: acceptorid,
    terminal: terminalid,
    type: type,
  };
}
