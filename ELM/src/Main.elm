module Main exposing(..)

import Browser
import Http
import Html exposing (..)
import Html.Events exposing (onInput,onClick)
import Html.Attributes exposing (..)
import Http
import Random
import Json.Decode as Decode exposing  (..)

main =
  Browser.element
    { init = init
    , update = update
    , subscriptions = subscriptions
    , view = view
    }

type alias Model =
  { list_def : WordDefinitions
  , word_list : List String
  , selected_word : String
  , state : State 
  , word_guessed : String
  , load : String
  , newLoad : String
  }
type State
  = Failure
  | Loading
  | Success (WordDefinitions)

type alias WordDefinition =
  {
    word : String
  , meanings : List Meaning
  }

type alias Definitions = 
  {
    definition : String 
  }

type alias Meaning = 
  {
    partOfSpeech : String 
  , definitions : List Definitions
  }

type alias WordDefinitions = List WordDefinition 
type alias Meanings = List Meaning
type alias ListDefinitions = List Definitions

type Msg
  = GotWord (Result Http.Error String)
  | Random_nb Int 
  | GotDefinition (Result Http.Error WordDefinitions)
  | Guessed String
  | Change String
  | Next

recupereJson : Decode.Decoder WordDefinitions
recupereJson = 
  Decode.list wordDecoder

wordDecoder : Decode.Decoder WordDefinition
wordDecoder =
  Decode.map2 WordDefinition
    (Decode.field "word" Decode.string )
    (Decode.field "meanings" <| Decode.list meaningsDecoder)

meaningsDecoder : Decode.Decoder Meaning
meaningsDecoder = 
  Decode.map2 Meaning 
    (Decode.field "partOfSpeech" Decode.string)
    (Decode.field "definitions" <| Decode.list definitionsDecoder)

definitionsDecoder : Decode.Decoder Definitions
definitionsDecoder = 
  Decode.map Definitions
    (Decode.field "definition" Decode.string) 

---------------WORD AND DEFINITION---------------

init : () -> (Model, Cmd Msg)
init _ =
  ( Model [] [] " " Loading  " " " " " "
  , Http.get
      { url = "../words.txt"
      , expect = Http.expectString GotWord
      }
  )

-------------------------UPDATE-------------------------
update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    GotWord (Ok text) ->
      let
        newModel =
          { model | word_list = String.split " " text, selected_word = "", word_guessed = "", load = "" }
      in
      (newModel, Random.generate Random_nb (Random.int 0 999))

    GotWord(Err _) ->
      ({model| state = Failure}
      , Cmd.none
      )

    Random_nb nb->
      let mot=Maybe.withDefault " " (List.head (List.drop nb model.word_list))
      in ({
        model|selected_word=mot}, Http.get
          { url = ("https://api.dictionaryapi.dev/api/v2/entries/en/"++mot)
          , expect = Http.expectJson GotDefinition recupereJson
          })
      
    GotDefinition def ->
      case def of
        Ok define -> 
          ({
            model | list_def = define , state = Success (define)
          }
          , Cmd.none)

        Err _ ->
          ({
            model| state = Failure
          }
          , Cmd.none)

    Guessed expr->
      let guess=model.selected_word
      in ({model|word_guessed=guess}, Cmd.none)
    
    Change message-> 
      let load=""
      in ({model|load=message, newLoad ="You guessed the word ! Congratulations ! You can restart now "}, Cmd.none)
    
    Next -> ({ model | selected_word = "", word_guessed = "", load = "", newLoad = "" }, Random.generate Random_nb (Random.int 0 999))
     
---------------------SUBSCRIPTIONS---------------------

subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none

-------------------------VIEW--------------------------

view : Model -> Html Msg
view model =
  case model.state of
    Failure ->
      div[][
        text ("I was unable to load your book.")
      ]
    Loading ->
      div [style "text-align" "center", style "margin-top" "20vh"] [
        h2 [style "color" "orange"] [text "Loading..."]
      ]

    Success result ->
        div
            [ style "display" "flex"
            , style "flex-direction" "column"
            , style "align-items" "center"
            , style "margin" "auto"
            , style "margin-top" "5vh"
            , style "margin-bottom" "5vh"
            , style "padding" "20px"
            , style "font-family" "arial"
            , style "background-color" "#f0f0f0"
            , style "border-radius" "8px"
            , style "box-shadow" "0 4px 8px rgba(0, 0, 0, 0.1)"
            , style "color" "green"
            ]
            [ h1 [ style "margin" "0" ] [ welcomeMessage ]
            , h3 [ style "margin" "0", style "margin-top" "10px", style "color" "#333" ] [ text "Try to guess the word below based on its definition" ]
            , div
                [ style "color" "#333"
                , style "font-size" "large"
                , style "margin-top" "10px"
                , style "text-align" "center"
                ]
                (convertData result)
            , div
                [ style "font-size" "large"
                , style "margin-top" "10px"
                , style "text-transform" "capitalize"
                , style "text-align" "center"
                ]
                [ text (model.word_guessed) ]
            , div
                [ style "display" "flex"
                , style "flex-direction" "column"
                , style "margin-top" "10px"
                ]
                [ input
                    [ placeholder "Guess the word"
                    , Html.Attributes.value model.load
                    , onInput Change
                    , style "width" "60%"
                    , style "margin" "auto"
                    , style "margin-bottom" "10px"
                    , style "padding" "10px"
                    , style "border" "1px solid #ccc"
                    , style "border-radius" "4px"
                    ]
                    []
                , if String.toLower model.load == String.toLower model.selected_word then
                    div
                        [ style "font-size" "large"
                        , style "color" "green"
                        , style "text-align" "center"
                        ]
                        [ text (model.newLoad) ]
                  else
                    div
                        [ style "font-size" "large"
                        , style "color" "red"
                        , style "text-align" "center"
                        ]
                        [ failureMessage ]
                ]
            , div
                [ style "display" "flex"
                , style "gap" "20px"
                , style "margin-top" "10px"
                ]
                [ convert (button [ onClick Guessed, style "flex-grow" "1" ] [ text "Show answer" ])
                , button [ onClick Next, style "flex-grow" "1" ] [ text "Get a new word" ]
                ]
            ]


convert : Html (String -> Msg) -> Html Msg
convert html =
    Html.map (\toMsg -> toMsg "") html
    
viewMeaning : Meaning -> Html Msg 
viewMeaning display1 = 
  li [ style "font-weight" "bold" 
     , style "text-transform" "capitalize"
     , style "padding" "5px"
     ]
    [text display1.partOfSpeech
    ,ul [ style "font-weight" "normal" 
        , style "text-transform" "none"
        , style "list-style" "arabic"
        ] 
        (List.map viewDefinition display1.definitions)
    ]

viewDefinition : Definitions -> Html Msg
viewDefinition display2 =
  li [] 
    [div [ style "font-style" "italic" 
         , style "padding-left" "5px" 
         ] [text display2.definition]]

viewWordDefinition : WordDefinition -> Html Msg
viewWordDefinition display3 = 
  div []
  [
    ul [ style "list-style" "none" ] (List.map viewMeaning display3.meanings)
  ]

convertData : WordDefinitions -> List (Html Msg)
convertData data =
   List.map (\display3 -> viewWordDefinition display3) data


-------------------------GAME-------------------------

welcomeMessage : Html Msg
welcomeMessage =
  div[] 
  [
    text "Welcome to guess it!"
  ]

failureMessage : Html Msg
failureMessage =
  div[] 
  [
    text "You didn't guess the word, try again or skip to the next one"
  ]


