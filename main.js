const applicationServerPublicKey = "BB-NDU5tDxSDgtTHY0YhRysa79xPSquxsISI7DthSx65U2MKV36l7j964zJrPOOsxEdiCgDSEuNQZUHmFSq-o6o";
const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;
/*
{
    "endpoint": "https://fcm.googleapis.com/fcm/send/dD-KGEsGjZM:APA91bG-c_98DxkFFHuPP3wxI8H8eSAPgMzVOqp_RcixVdlHGFMzCR6KNhs1wBon4DaXAw-LETWcrUsRV_knDIjsgSsXuQkt5L7tC_Ny-vnw5_LwE4ELnB0pr6q2LpdNDGQ2StggheqR",
    "expirationTime": null,
    "keys": {
        "p256dh": "BNGhXViJrt95EEEF978c11bBGbZF6KaGt8-iM_8gkKkbwDuFc3Z8qOYbSX67JIbRgSHue5EpKZXY6jAkkqBK_4E",
        "auth": "tP8v0WJ5Aw-hErL83Psykg"
    }
}
*/
// ur lbase 64
function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

//desabilita el boton si ya esta suscrito
function updateBtn() {
    if (isSubscribed) {
        pushButton.textContent = 'Disable Push Messaging';
    } else {
        pushButton.textContent = 'Enable Push Messaging';
    }

    pushButton.disabled = false;
}
// METODO PARA ENVIA SUBSCRIPCION AL BACKEND
function updateSubscriptionOnServer(subscription) {
    // TODO: Send subscription to application server

    const subscriptionJson = document.querySelector('.js-subscription-json');
    const subscriptionDetails =
        document.querySelector('.js-subscription-details');

    if (subscription) {
        subscriptionJson.textContent = JSON.stringify(subscription);
// SUBSCRIPCION DE USUARIO PARA LAS NOTIFY

/*const data = { 
                token_notify:JSON.stringify( subscription),
                        _idUser:"1"
                }

                */
  var finalPushSubscription = JSON.stringify(subscription);
  finalPushSubscription = JSON.parse(finalPushSubscription);
  finalPushSubscription.p256dh = finalPushSubscription.keys.p256dh;
  finalPushSubscription.auth = finalPushSubscription.keys.auth;

var x= fetch("http://localhost:3000/push", {
    method: "POST",
    body: JSON.stringify(finalPushSubscription),
    headers: {
        "content-type": "application/json"
    }
}).then(res => res.json())
    .catch(error => console.err('Error:', error))
    .then(response => console.log('Success:', response));


       // console.log(resul);
        console.log(JSON.stringify({ token_notify:subscription,_idUser :'1' }))


        subscriptionDetails.classList.remove('is-invisible');
    } else {
        subscriptionDetails.classList.add('is-invisible');
    }
}








//inicio estado del usuario dio o no dio permiso para push
function initialiseUI() {
  pushButton.addEventListener('click', function () {
      pushButton.disabled = true;
      if (isSubscribed) {
          unsubscribeUser();
      } else {
          subscribeUser();
      }
  });

    // Set the initial subscription value
    swRegistration.pushManager.getSubscription()
        .then(function (subscription) {
            isSubscribed = !(subscription === null);

            updateSubscriptionOnServer(subscription);

            if (isSubscribed) {
                console.log('User IS subscribed.');
            } else {
                console.log('User is NOT subscribed.');
            }

            updateBtn();
        });
}


//SUBSCRIPCION A PUSH USER NUEVO O RECIEND DA PERMISO
function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        })
        .then(function (subscription) {
            console.log('SUBSCRIPCION DEL USUARIO:', subscription);

            updateSubscriptionOnServer(subscription);

            isSubscribed = true;

            updateBtn();
        })
        .catch(function (err) {
            console.log('FALLO EN LA SUBSCRIPCION: ', err);
            updateBtn();
        });
}

//eliminar subscripcion de usuario (esto es para que deje de recibir notify push)
function unsubscribeUser() {
    swRegistration.pushManager.getSubscription()
        .then(function (subscription) {
            if (subscription) {
                return subscription.unsubscribe();
            }
        })
        .catch(function (error) {
            console.log('Error unsubscribing', error);
        })
        .then(function () {
            updateSubscriptionOnServer(null);

            console.log('User is unsubscribed.');
            isSubscribed = false;

            updateBtn();
        });
}


//verifi y registra el service worker
if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is SOPORTA');
    navigator.serviceWorker.register('sw.js')
        .then(function (swReg) {
            console.log('Service Worker is REGISTRA', swReg);
            swRegistration = swReg;
            initialiseUI(); //inicia despues de registrar service worker
        })
        .catch(function (error) {
            console.error('Service Worker Error', error);
        });
} else {
    console.warn('Push messaging is NO SOPORTA');
    pushButton.textContent = 'Push NO SOPORTA';
}
