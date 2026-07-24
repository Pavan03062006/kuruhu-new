# Backend bounded contexts

Each directory is an independently evolvable domain boundary. Future modules should expose application services and contracts, keep persistence adapters private, and register only their HTTP routers at the API composition root. Session 1 intentionally contains no domain behavior.
