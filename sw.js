
//evento receptor del service worker... aqui recibe los mensajes push
//del backend con el metodo --->  webpush.sendNotification(subscription, payload).catch(err => console.error(err));
self.addEventListener('push', function (event) {
    console.log('[Service Worker] RECIBE PUSH.');
    console.log(`[Service Worker] LOS DATOS DEL MSG PUSH: "${event.data.text()}"`);
let notification = event.data.json();
    let title = 'the Sniper.com';
    	if (notification) {
    	    if (notification.title) {
    	        title = notification.title
    	    }
        }
        
    const options = {
        body: 'Bienvenido a theSniper',
        icon: 'images/icon.png',
        badge: 'images/badge.png'
    };
    /* let title = 'Echyzen Website'
	if(notification) {
		if(notification.title) {
			title = notification.title
		}	
	} */

    event.waitUntil(self.registration.showNotification(title, notification));
});

// EVENTO DEL CLICK A LA NOTIFICACION
self.addEventListener('notificationclick', function (event) {
    console.log('[Service Worker] RECIBE EL CLICK DE LA Notification.');

    event.notification.close();

    event.waitUntil(
        //AQUI LO MANDA A ESTA PAGINA
        clients.openWindow('https://developers.google.com/web/')
    );
});
