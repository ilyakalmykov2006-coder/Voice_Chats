-- Seed data (example only; replace hashes with real argon2 outputs)
DECLARE @u1 UNIQUEIDENTIFIER = NEWID();
DECLARE @u2 UNIQUEIDENTIFIER = NEWID();
DECLARE @u3 UNIQUEIDENTIFIER = NEWID();
DECLARE @s1 UNIQUEIDENTIFIER = NEWID();
DECLARE @c1 UNIQUEIDENTIFIER = NEWID();

INSERT INTO [Users] ([Id], [Email], [Username], [PasswordHash], [Presence]) VALUES
(@u1, 'alice@example.com', 'Alice', '$argon2id$v=19$m=65536,t=3,p=4$example', 'offline'),
(@u2, 'bob@example.com', 'Bob', '$argon2id$v=19$m=65536,t=3,p=4$example', 'offline'),
(@u3, 'carol@example.com', 'Carol', '$argon2id$v=19$m=65536,t=3,p=4$example', 'offline');

INSERT INTO [Servers] ([Id], [OwnerUserId], [Name], [Description]) VALUES
(@s1, @u1, 'Team Alpha', 'Primary collaboration server');

INSERT INTO [ServerMemberships] ([ServerId], [UserId], [Role]) VALUES
(@s1, @u1, 'owner'),
(@s1, @u2, 'member'),
(@s1, @u3, 'member');

INSERT INTO [Channels] ([Id], [ServerId], [Type], [Name], [Position]) VALUES
(@c1, @s1, 'text', 'general', 0);

INSERT INTO [Messages] ([ChannelId], [AuthorUserId], [Content]) VALUES
(@c1, @u1, N'Добро пожаловать в Team Alpha!');

INSERT INTO [Friends] ([RequesterId], [AddresseeId], [Status]) VALUES
(@u1, @u2, 'accepted');
