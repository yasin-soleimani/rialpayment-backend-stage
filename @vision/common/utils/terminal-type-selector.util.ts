import { TerminalType } from "@vision/common/enums/terminalType.enum";

export function terminalSelector( type ) {
  switch( type ) {

    case TerminalType.Mobile: {
      return 'MPOS';
    }

    case TerminalType.Pos: {
      return 'Pos';
    }

    case TerminalType.Internet: {
      return 'IPG';
    }

    case TerminalType.Kiosk: {
      return 'Kiosk';
    }
  }
}