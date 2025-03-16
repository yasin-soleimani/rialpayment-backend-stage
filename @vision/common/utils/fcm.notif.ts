import * as FCM from 'fcm-node';
export async function getHeaderType(to: string, title: string, body: string): Promise<any>
{
    const serverKey = 'AAAAPO-azqs:APA91bFwZew90qsemJ9bO0pO2sPXlCXdoJMe6Cg4U5s9hZlCh3vb933vZ4p2PZcEvHBnA6K5jUqNftVP6q9MzSLc6dARhwpmu-2fWltxZf9yk8QqaksYGXGp-zvmQo3BSCPJmH3rwTuZ';
    const fcm = new FCM(serverKey);

    const message = {
        to: 'd_wR3kn5foo:APA91bF2-EFWGWBGaO2kTUv7XvSvE4JEZIXqF6hJomWGz6-3dGUhELvlm88LSI8gQOSxWBWnfnGLulBKUvt0vUWthaAGa9X3U_kcvLsK-DpsYF1iEHiV7DrI_SoZKKP31hqqjMGqC32t',
        notification: {
            title: 'Title of your push notification',
            body: 'Body of your push notification',
        },
    };

    fcm.send(message, (err, response) => {
        if (err) {
            console.log(err);
            console.log('Something has gone wrong!');
        } else {
            console.log('Successfully sent with response: ', response);
        }
    });
}