# GraphD3

_Ca fait un jeu de mot entre graphe, Raphael et D3, m'voyez ?..._
**L'auteur**

## Qu'est-ce donc ?

Il s'agit ici d'une petite bibliothèque très minimale, permettant d'afficher un graphe en Javascript, à l'aide des fonctionnalités de Raphael et D3.

Pourquoi ? Utiliser ces deux bibliothèques, qui se recoupent ? D3 est assez complexe à prendre en main. Rome ne s'est pas faite en un jour, ce n'était rien à côté de la maitrise parfaite du paradigme data-oriented de D3 (j'exagère un chouïa, mais vous voyez le concept). Raphael, en revanche, est assez simple et direct à l'utilisation, avec une API évoquant jQuery. Cependant, il lui manque une chose, dont est doté D3 : la gestion des échelles.

Et ainsi, Raphael est utilisé pour le rendering tandis que D3 sert à calculer les échelles.

## Pourquoi pas nvd3.js ?

Les fonctionnalités sont super chez nvd3 ! Par contre, le code est (ou était, à l'heure de l'écriture de cette bibliothèque) immonde. Basiquement, adapter cette bibliothèque a des besoins spécifique était simplement impossible (rien que changer une échelle pour utiliser une échelle temporaire à la place d'une échelle linéaire impliquait de soit modifier le code de la bibliothèque, soit être près à réinitialiser tout ce qui concerne les échelles et espérer que ça ne casse pas. Pas glop.).

## Et du coup ?

Notre petite bibliothèque permet de faire deux types de graphes :

- **Un graphe simple**, qui affiche un simple graphe
- **Un graphe composé**, qui affiche plusieurs graphes superposés (deux modes sont disponibles en ce qui concerne l'axe vertical : soit on étend l'échelle de façon à ce qu'elle corresponde à l'échelle minimale nécessaire pour afficher tout les sous-graphes, soit on ramène toutes les échelles à la plus petite).
- **Un graphe à portée**, qui affiche deux graphes composés l'un au dessus de l'autre, et propose deux curseurs de sélection de portée : l'affichage du graphe du haut se base sur l'intervalle sélectionné avec ces deux curseurs.

## Avantages / Inconvénients

- Le code est propre.
- Le code est modulaire (les composants peuvent facilement être repris dans de futurs graphes).
- La customization de l'interface est très simple avec les classes CSS.
- Easy-install.

- Un seul graphe ! Désolé !
- Pas de style sur IE. Le code se base sur des classes CSS afin de séparer la logique de l'affichage, et ça ne fonctionne malheureusement pas avec le VML. Merci IE.
- Un petit peu de lags sur le graphe de portée. Mais pas grand chose, je chipotte.

## API

Consultez le fichier d'exemple, c'est probablement le plus parlant !
