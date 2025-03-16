import * as FCM from 'fcm-node';
import { FCMConst } from "@vision/common/constants/fcm.const";

export function sendNotif(to: string, amount: number, type?: number) {
  let title = 'خرید نقدی';
  let msg = 'خرید با موفقیت انجام شد \n مبلغ : ' + amount + ' ریال';
  if ( type === 2 ) {
    title = 'انتقال وجه';
    msg = 'انتقال با موفقیت انجام شد \n مبلغ : ' + amount + ' ریال';
  }
 const serverKey = FCMConst.serverKey;
 const fcm = new FCM(serverKey);
 const message = format(to, amount, msg, title);
  fcm.send(message, function(err, response){
    if (err) {
      console.log(err);
      console.log("Something has gone wrong!");
    } else {
      console.log("Successfully sent with response: ", response);
    }
  });
}

export async function SendNotification( to: string, message: string, title: string ): Promise<any> {
  const serverKey = FCMConst.serverKey;
  const fcm = new FCM(serverKey);
  const msg = NotificationFormat(to, message, title);

  return new Promise(function(resolve, reject) {
    fcm.send(msg, function(err, response){
      if (err) {
        reject( err );
      } else {
        resolve( response);
      }
    });
  });

}

function format(to: string, amount: number, msg, title) {
  return {
    to: to,
    notification: {
      color: '#563BC5',
      title: title,
      body: msg,
      sound: "ding_efect.caf"
    },
    data: {
      title: title,
      body: msg,
    },
    apns: {
      headers: {
        'apns-priority': '10'
      },
      payload: {
        aps: {
          alert: {
            sound: "ding_efect.caf"
          },
        }
      }
    },
    android: {
      ttl: 3600 * 1000,
      priority: 'normal',
      notification: {
        color: '#563BC5',
        sound: "ding_efect.mp3"
      }
    },
  };
}


function NotificationFormat(to: string, message: string, title: string ) {
  return {
    to: to,
    notification: {
      color: '#563BC5',
      title: title,
      body: message,
      sound: "ding_efect.caf"
    },
    data: {
      title: title,
      body: message,
    },
    apns: {
      headers: {
        'apns-priority': '10'
      },
      payload: {
        aps: {
          alert: {
            sound: "ding_efect.caf"
          },
        }
      }
    },
    android: {
      ttl: 3600 * 1000,
      priority: 'normal',
      notification: {
        color: '#563BC5',
        sound: "ding_efect.mp3"
      }
    },
  };
}

