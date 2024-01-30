module Main exposing (..)

import Html exposing (Html, text, div, button)
import Http
import Json.Decode as Decode
import Random
import Json.Decode exposing (Decoder, list, field, string, map)

-- Model representing the application state
type alias Model =
    { wordList : List String
    , currentWord : Maybe String
    , definitions : List String
    , userGuess : String
    , error : Maybe String
    , randomSeed : Random.Seed
    
    }

initialModel : Model
initialModel =
    { wordList = []
    , currentWord = Nothing
    , definitions = []
    , error = Nothing
    , randomSeed = Random.initialSeed 0
    }

-- Messages for user actions and HTTP responses
type Msg
    = FetchWords
    | WordsFetched (Result Http.Error String)
    | SetRandomWord Int
    | FetchDefinitions
    | SubmitGuess String
    | DefinitionsFetched (Result Http.Error (List String))

-- Update function to handle state changes
update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        FetchWords ->
            -- Existing code for fetching words
            (model, Http.get { url = "https://perso.liris.cnrs.fr/tristan.roussillon/GuessIt/thousand_words_things_explainer.txt", expect = Http.expectString WordsFetched })

        WordsFetched result ->
            -- Existing code for handling fetched words
            case result of
                Ok wordString ->
                    let
                        words = String.split "\n" wordString
                        randomCmd = Random.generate SetRandomWord (Random.int 0 (List.length words - 1))
                    in
                    ( { model | wordList = words }, randomCmd )

                Err _ ->
                    ( { model | error = Just "Failed to fetch words" }, Cmd.none )

        SetRandomWord index ->
            -- Existing code for setting random word
            let
                word = List.Extra.getAt index model.wordList
            in
            case word of
                Just w ->
                    ( { model | currentWord = Just w }, Cmd.none )
                Nothing ->
                    ( model, Cmd.none )

        FetchDefinitions ->
            case model.currentWord of
                Just word ->
                    ( model, Http.get { url = "https://api.dictionaryapi.dev/api/v2/entries/en/" ++ word, expect = Http.expectJson DefinitionsFetched definitionDecoder } )
                Nothing ->
                    ( model, Cmd.none )

        DefinitionsFetched result ->
            case result of
                Ok defs ->
                    ( { model | definitions = defs }, Cmd.none )
                Err _ ->
                    ( { model | error = Just "Failed to fetch definitions" }, Cmd.none )

        -- Other cases
        SubmitGuess guess ->
            if Just guess == model.currentWord then
                ( { model | userGuess = guess, messageToUser = "Congratulations! You guessed correctly." }, Cmd.none )
            else
                ( { model | userGuess = guess, messageToUser = "Incorrect. Please try again." }, Cmd.none )

-- View function to render the UI
view : Model -> Html Msg
view model =
    -- Existing code for view
    div []
        [ headerView
        , wordView model
        , definitionsView model
        , guessInputView
        , messageView model
        , errorView model
        ]

headerView : Html Msg
headerView =
    div [ class "header" ]
        [ h1 [] [ text "Guess the Word Game" ]
        , p [] [ text "Try to guess the word based on its definitions." ]
        ]

wordView : Model -> Html Msg
wordView model =
    div [ class "word" ]
        [ case model.currentWord of
            Just word ->
                div [] [ text ("Current Word: " ++ word) ]
            Nothing ->
                text "No word selected"
        ]

definitionsView : Model -> Html Msg
definitionsView model =
    div [ class "definitions" ]
        [ ul []
            (List.map (\definition -> li [] [ text definition ]) model.definitions)
        ]

guessInputView : Model -> Html Msg
guessInputView model =
    div [ class "guess-input" ]
        [ input [ type_ "text", placeholder "Enter your guess here...", onInput SubmitGuess ] []
        , button [ onClick (SubmitGuess model.userGuess) ] [ text "Submit Guess" ]
        ]

messageView : Model -> Html Msg
messageView model =
    div [ class "message" ]
        [ text model.messageToUser ]

errorView : Model -> Html Msg
errorView model =
    div [ class "error" ]
        [ case model.error of
            Just errorMsg ->
                text ("Error: " ++ errorMsg)
            Nothing ->
                text ""
        ]

-- Definition decoder
definitionDecoder : Decode.Decoder (List String)
definitionDecoder =
    -- You need to write a decoder based on the structure of the dictionary API's response
    field "meanings" (list (field "definitions" (list (field "definition" string))))
        |> map List.concat

-- Main entry point
main =
    Html.program
        { init = (initialModel, FetchWords)
        , view = view
        , update = update
        , subscriptions = \_ -> Sub.none
        }
