# JeuxSite
A simple and easy way to use 1 machine for unlimited domains/sub-domains (and still using nodes!)

Why would you want that ?

Let's say you own a domain like `jehende.fr` and you only have one server but you really want to also have a subdomain like `jeuxgate.jehende.fr` and you need to use nodejs for each of them.

Well JeuxSite can do that. (and of course it runs on 80 port and 443 (yes, it supports https)).

Oh and it can handle multiple domain running on one machine.


## Setup
it's simple :

 - *buy a domain if you don't have one*
 - download the code (as zip and extracting it, or using git)
 - edit `config.yml` to your liking
 - do `npm i` in the directory of the code
 - start and stop
 - and edit.

That's not all, you also need to redirect the domain to your server (and the sub-domain if you want)

## Socket.io
Yes it supports socket.io and it will automatically shift socket.io on https if you have it turned on (if you only have http, no worry, it will automatically use http)

## Modules

When you use module in your code, just remember that you code was 'required' from JeuxSite so for example, when using fs, tell it the entire directory you want. (you can use the `${config.path + domain}` in your code for example)

## Use modules

I lied, you "must" install modules in the directory of the domain but, you can also use the code in the example to use module installed in the JeuxSite dir.