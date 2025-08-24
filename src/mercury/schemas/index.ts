import { gql } from "@apollo/client/core";

export const LOGIN_USER = gql`
  mutation Login($input: LoginInput) {
    login(input: $input) {
      access_token
      user {
        ... on User {
          name
          uuid
          email
          email_verified_at
        }
        ... on PlatformUser {
          name
          uuid
          email
          email_verified_at
        }
      }
    }
  }
`;
