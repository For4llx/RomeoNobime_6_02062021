const Sauce = require('../models/Sauce');
const fs = require('fs');
const { findOne } = require('../models/Sauce');

exports.likeSauce =  (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then
  (
    function(data)
    {
      let index = "";
      let likes = data.usersLiked.length;
      let dislikes = data.usersDisliked.length;
      let userHasLiked = data.usersLiked.includes(req.body.userId);
      let userHasDisliked = data.usersDisliked.includes(req.body.userId);

      if(req.body.like == 1 && !userHasLiked)
      {
        data.usersLiked.push(req.body.userId);
        likes = data.usersLiked.length;

        Sauce.findByIdAndUpdate({ _id: req.params.id }, { $push: { usersLiked: req.body.userId }, $set: { likes } })
          .then(() => res.status(200).json({ message: "J'aime"}))
          .catch(error => res.status(400).json({ error }));
      }
      else if(req.body.like == -1 && !userHasDisliked)
      {
        data.usersDisliked.push(req.body.userId);
        dislikes = data.usersDisliked.length;

        Sauce.findByIdAndUpdate({ _id: req.params.id }, { $push: { usersDisliked: req.body.userId }, $set: { dislikes } })
          .then(() => res.status(200).json({ message: "J'aime pas"}))
          .catch(error => res.status(400).json({ error }));
      }
      else if(req.body.like == 0 && userHasLiked)
      {
        index = data.usersLiked.indexOf(req.body.userId);
        data.usersLiked.splice(index, 1);
        likes = data.usersLiked.length;

        Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId }, $set: { likes }})
          .then(() => res.status(200).json({ message: "Je retire mes appréciations"}))
          .catch(error => res.status(400).json({ error }));
      }
      else if(req.body.like == 0 && userHasDisliked)
      {
        index = data.usersDisliked.indexOf(req.body.userId);
        data.usersDisliked.splice(index, 1);
        dislikes = data.usersDisliked.length;

        Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: req.body.userId }, $set: { dislikes }})
          .then(() => res.status(200).json({ message: "Je retire mes appréciations"}))
          .catch(error => res.status(400).json({ error }));
      }
      else
      {
        console.log("error");
      }
    }
  )
  .catch
  (
    function(error)
    {
      console.log(error);
    }
  )
}
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
    //Créé une instance de l'objet thing sans l'id
    delete sauceObject._id;
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    //Enregistrement dans la base de données avec la méthode save() du modèle thing qui renvoie une promise qui doit être résolu
    sauce.save()
      .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
      .catch(error => res.status(400).json({ error }));
  };

//On modifie un objet dans la base de données avec la méthode updateOne qui prend en paramètre l'objet de comparaison et en 2ème le nouvelle objet
exports.modifySauce =  (req, res, next) => {
  const sauceObject = req.file ?
  {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : {...req.body};
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Objet modifié !'}))
      .catch(error => res.status(400).json({ error }));
  }

//On surpprime un objet de la base de données avec la méthode deleteOne qui prend en paramètre l'objet de comparaison
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
        .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({error}));
  };

//On récupère un seul objet de la liste avec findOne
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })//On compare _id à req.params.id s'ils sont pareil alors on envoie l'objet qui à cette id
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(404).json({ error }));//Si aucun thing n'est trouvé une erreur sera envoyé
  }

//On récupère la liste complète avec la méthode find() sans paramètres du modèle thing qui renvoie une promise qui doit être résolu
exports.getAllSauce = (req, res, next) => {
    Sauce.find()
      .then(sauces => res.status(200).json(sauces)) //envoie en réponse le status 200 avec l'objet things
      .catch(error => res.status(400).json({ error }));
  }