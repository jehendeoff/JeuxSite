# JeuxSite
A simple and easy way to use 1 machine for unlimited domains/sub-domains (and still using nodejs!)

Why would you want that ?

let's say you own a domain like `jehende.fr` and you only have one server but you realy want to also have a subdamin like `jeuxgate.jehende.fr` and you need to use nodejs for each of them.
Well JeuxSite can do that. (and of course it runs on 80 port and 443 (yes, it supports https))
Oh and you can have multiple domain running on one machine.


## Setup
it's simple :

 - *buy a domain if you don't have one*
 - download the code (as zip and extracting it, or using git)
 - edit `config.yml` to your liking
 - do `npm i` in the directory of the code
 - start and stop
 - and edit.

that's not all, you also need to redirect the domain to your server (and the sub-domain if you want)

## Modules

When you use module in your code, just remember that you code was 'required' from JeuxSite so for example, when using fs, tell it the entire directory you want.

## Use modules

if you want to use module in your code, don't install then in the folder of your code, bot in the folder of JeuxSite!

Why ? well since it's JeuxSite that's requiring your code, node will search for module in the folder of JeuxSite