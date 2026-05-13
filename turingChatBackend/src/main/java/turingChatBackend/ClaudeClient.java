package turingChatBackend;

import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.concurrent.TimeUnit;

//Calls the Claude API with a prompt, parses the AI’s JSON response, and converts it into a BotDecision used by the bot system.
@Service
public class ClaudeClient {

    private static final String API_URL = "https://api.anthropic.com/v1/messages";

    private final OkHttpClient client;
    private final String apiKey; //gets key from properties file
    private final ObjectMapper mapper = new ObjectMapper();

    //init claude connection and verification
    public ClaudeClient(@Value("${claude.api.key:NOT_SET}") String apiKey) {

        System.out.println("Loaded Claude API key = " +
                (apiKey.equals("NOT_SET") ? "NOT_SET" : "OK"));

        this.apiKey = apiKey;

        if ("NOT_SET".equals(apiKey)) {
            throw new RuntimeException("claude.api.key is missing in application.properties");
        }

        this.client = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .build();
    }

    //gets prompt message and returns claude response
    public BotDecision getBotDecision(String prompt) {

        try {
            String escapedPrompt = escape(prompt);
            
            //build json 
            String jsonPayload =
                    "{"
                            + "\"model\":\"claude-opus-4-7\","
                            + "\"max_tokens\":300,"
                            + "\"messages\":[{"
                            + "\"role\":\"user\","
                            + "\"content\":\"" + escapedPrompt + "\""
                            + "}]"
                            + "}";

            RequestBody body = RequestBody.create(
                    jsonPayload,
                    MediaType.parse("application/json")
            );

            Request request = new Request.Builder()
                    .url(API_URL)
                    .post(body)
                    .addHeader("x-api-key", apiKey)
                    .addHeader("anthropic-version", "2023-06-01")
                    .addHeader("Content-Type", "application/json")
                    .build();

            try (Response response = client.newCall(request).execute()) {

                String raw = response.body() != null ? response.body().string() : "";

                System.out.println("AI Response Status: " + response.code());

                //if there was an error
                if (!response.isSuccessful()) {
                    return new BotDecision(3, "...", true);
                }

                JsonNode root = mapper.readTree(raw);

                String text = root
                        .path("content")
                        .get(0)
                        .path("text")
                        .asText();

                JsonNode parsed = mapper.readTree(text);

                //extract different sections of response
                int waitSeconds = parsed.has("waitSeconds")
                        ? parsed.get("waitSeconds").asInt(2)
                        : 2;

                String message = parsed.has("message")
                        ? parsed.get("message").asText()
                        : "...";

                boolean shouldRespond = parsed.has("shouldRespond")
                        ? parsed.get("shouldRespond").asBoolean(true)
                        : true;

                return new BotDecision(waitSeconds, message, shouldRespond);
            }

        } catch (Exception e) {
            e.printStackTrace();
            return new BotDecision(3, "...", true);
        }
    }
    
    //helper for parsing json
    private String escape(String input) {
        return input
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}