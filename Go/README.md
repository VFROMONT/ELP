### Projet Go - Password Bruteforce

**Description :**
Ce programme en GoLang permet le bruteforce de mots de passes hachés avec l'algorithme sha-256.

**Instructions d'utilisation :**
1. Clonez le projet avec `git clone https://github.com/VFROMONT/ELP.git`
2. Téléchargez le fichier de dictionnaire `Medium Combined` [disponible sur ce lien](https://hashmob.net/resources/hashmob) ou tout autre fichier de dictionnaire
3. Dézippez-le puis placer le dans le dossier `Go`. Modifiez le `dictionaryPath` dans le main du server pour qu'il corresponde au nom du fichier dictionnaire.
4. Ouvrez un terminal et placez-vous dans le dossier `Go`.
5. Démarrez le serveur : `go run bruteforce_server.go`
6. Démarrez le client dans un terminal séparé : `go run bruteforce_client.go`
7. Saisissez le nombre de workers (GoRoutines) à utiliser pour une vitesse de calcul optimale (!!! inférieur au nombre de coeurs de votre processeurs)
8. Saisissez le chemin vers le fichier de sommes de hachage à cracker (vous pouvez utiliser les fichiers `hash_sums.found` ou `hash_sums2.found` en guise de test ou spécifier un autre fichier à votre disposition)
9. Le bruteforce commence ! Vous n'avez plus qu'à attendre qu'il se termine. Dès la fin du bruteforce le temps de calcul vous est donné. Vous pouvez retrouver le fichier `bruteforce_output` avec les mots de passe crackés dans le dossier du client (le dossier `Go` par défaut).


**Contributeurs :**
- Julien GEYER, Vincent FROMONT et Yasmine TARIK : Conception et développement.