import React, { useState } from "react";

import close from "../images/CloseIcon.svg";

import { Header } from "./Header.js";
import { Footer } from "./Footer.js";
import { Main } from "./Main.js";

import { PopupWithForm } from "./PopupWithForm.js";

import { ImagePopup } from "./ImagePopup.js";

import { apiObj } from "../utils/Api.js";

import { UserContext } from "../contexts/CurrentUserContext";
import { EditProfilePopup } from "./EditProfilePopup";
import { EditAvatarPopup } from "./EditAvatarPopup";
import { AddPlacePopup } from "./AddPlacePopup";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  //this is called when the component is mounted. we pass it [] to make sure it only gets call once when its mounted
  //otherwise it would be called every time it updates
  React.useEffect(() => {
    apiObj.getUserInfo().then((userInfoResponse) => {
      setCurrentUser(userInfoResponse);
    });
  }, []);

  const [selectedCard, setSelectedCard] = useState(null);

  /*state variables responsible for visibility of popups*/
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);

  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);

  function handleEditAvatarClick() {
    /*const modal = document.querySelector("#edit-avatar-modal");
    modal.classList.add("modal_open");*/
    setIsEditAvatarPopupOpen(true);
  }

  function handleEditProfileClick() {
    /*const modal = document.querySelector("#edit-profile-modal");
    modal.classList.add("modal_open");*/
    setIsEditProfilePopupOpen(true);
  }

  function handleEditPlaceClick() {
    /*const modal = document.querySelector("#add-card-modal");
    modal.classList.add("modal_open");*/
    setIsAddPlacePopupOpen(true);
  }

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsImagePopupOpen(false);
    setTimeout(() => {
      setSelectedCard(null);
    }, 500);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
    setIsImagePopupOpen(true);
  }

  function handleUpdateUser(info) {
    console.log("user was updated in app.js");
    apiObj
      .patchUserInfo(info)
      .then((userInfoResponse) => {
        setCurrentUser(userInfoResponse);
      })
      .then(closeAllPopups());
  }

  function handleUpdateAvatar(info) {
    console.log("updated avatar");
    console.log(info);
    apiObj
      .patchUserAvatar(info)
      .then((userInfoResponse) => {
        setCurrentUser(userInfoResponse);
      })
      .then(closeAllPopups());
  }

  function handleAddPlace(info) {
    console.log("yes");
    apiObj
      .uploadCard(info)
      .then((newCard) => {
        setCards([newCard, ...cards]);
      })
      .then(closeAllPopups());
  }

  /////////////////////////////////////////////////////////////////////////////cards code
  /*state variables */
  const [cards, setCards] = useState([]);

  React.useEffect(() => {
    //load the initial cards from the server
    apiObj
      .getInitialCards()
      .then((cardsResponse) => {
        setCards(cardsResponse);
      })
      .catch((err) => {
        console.log(err); // log the error to the console
      });
  }, []); //empty array tells it to only do once (when it is mounted)

  function handleCardLike(card) {
    // Check one more time if this card was already liked
    //The some() method tests whether at least one element in the array passes the test
    //in this case, if 1 of the likes is from the current user, we need to make the heart dark
    const isLiked = card.likes.some((user) => user._id === currentUser._id);

    console.log("you liked the card", isLiked);
    // Send a request to the API and getting the updated card data
    //if !isLiked- if the card was not liked before and now the user wants to like it
    if (!isLiked) {
      console.log("you like the card");
      apiObj.likeCard(card._id).then((newCard) => {
        setCards((state) =>
          state.map((currentCard) =>
            currentCard._id === card._id ? newCard : currentCard
          )
        );
      });
    }
    //if isLiked - if the user already liked it and is now unliking it
    else {
      console.log("you unlike the card");
      apiObj.unlikeCard(card._id).then((newCard) => {
        setCards((state) =>
          state.map((currentCard) =>
            currentCard._id === card._id ? newCard : currentCard
          )
        );
      });
    }
  }

  function handleCardDelete(card) {
    console.log("u deleted the card");
    apiObj
      .deleteCard(card._id)
      .then(() => {
        //filter will only include cards that pass the test- in this case, it includes all cards except the deletedCard
        setCards((state) =>
          state.filter((CurrentCard) => CurrentCard._id !== card._id)
        );
      })
      .then(console.log(cards));
  }

  return (
    <UserContext.Provider value={currentUser}>
      <div className="page">
        <div className="page__content">
          <Header />
          <Main
            onEditProfileClick={handleEditProfileClick}
            onAddPlaceClick={handleEditPlaceClick}
            onEditAvatarClick={handleEditAvatarClick}
            onCardClick={handleCardClick}
            cards={cards}
            onCardLike={handleCardLike}
            onCardDelete={handleCardDelete}
          />
          <Footer />

          <EditAvatarPopup
            isOpen={isEditAvatarPopupOpen}
            onClose={closeAllPopups}
            onUpdateAvatar={handleUpdateAvatar}
          />
          <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onClose={closeAllPopups}
            onUpdateUser={handleUpdateUser}
          />

          <AddPlacePopup
            isOpen={isAddPlacePopupOpen}
            onClose={closeAllPopups}
            onAddPlace={handleAddPlace}
          />

          <PopupWithForm
            title="Are you sure?"
            //fix the name and isOpen later - this is the confirmation popup for delete
            name=""
            isOpen={false}
            onClose={closeAllPopups}
          />
        </div>

        <ImagePopup
          card={selectedCard}
          onClose={closeAllPopups}
          isOpen={isImagePopupOpen}
        />

        {/*modal for the image popup*/}
        <div className="popup modal" id="image-popup">
          <div className="popup__content">
            <img className="popup__image" />
            <button type="button" className="modal__close-button">
              <img src={close} alt="X" />
            </button>
            <h2 className="popup__caption">insert caption here</h2>
          </div>
        </div>

        {/*modal for the delete button to ask if the user is sure*/}
        <div className="modal" id="delete-card-modal">
          <div className="modal__content">
            <button type="button" className="modal__close-button">
              <img src={close} alt="X" />
            </button>
            <h2 className="modal__title">Are you sure?</h2>
            <form name="delete" className="modal__form">
              {/*form is needed so that PopupWithForm class works with this html*/}
              <button type="submit" className="modal__submit-button">
                Yes
              </button>
            </form>
          </div>
        </div>
      </div>
    </UserContext.Provider>
  );
}

export default App;
