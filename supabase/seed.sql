-- Seed minimal data for initial admin and room order

insert into public.rooms (room_number, title, topic, difficulty, objective, scenario, instructions, order_number, status)
values
  (1, 'Login Security', 'Password Security / Secure Login', 'Beginner', 'Teach secure login credentials', 'A locked terminal awaits a secure password.', 'Create a secure password using the rules provided.', 1, 'active'),
  (2, 'Phishing Email', 'Phishing Detection', 'Beginner', 'Identify phishing indicators', 'A suspicious email arrives on the workstation.', 'Select the suspicious elements in the email.', 2, 'active'),
  (3, 'Password Security', 'Password Security', 'Beginner', 'Build strong passwords', 'A digital vault blocks the path.', 'Create a strong password that satisfies the rules.', 3, 'active'),
  (4, 'Malware Investigation', 'Malware Awareness', 'Intermediate', 'Identify suspicious files and activities', 'Suspicious files are present on a workstation.', 'Inspect the clues and identify malicious indicators.', 4, 'active'),
  (5, 'Encryption Challenge', 'Encryption', 'Intermediate', 'Decrypt a Caesar cipher message', 'An encrypted note is pinned to the wall.', 'Use the cipher tools to decode the message.', 5, 'active'),
  (6, 'Network Security', 'Network Security', 'Advanced', 'Identify safer network configuration', 'A network diagram is vulnerable.', 'Choose the safer configuration.', 6, 'active'),
  (7, 'Incident Response', 'Incident Response', 'Advanced', 'Analyze logs and choose proper response', 'Logs and evidence are scattered across the screen.', 'Determine the incident and response steps.', 7, 'active'),
  (8, 'Final CyberEscape', 'Capstone Cybersecurity Challenge', 'Advanced', 'Complete the final sequence', 'The final escape door is locked.', 'Solve the combined challenge.', 8, 'active')
on conflict (room_number) do nothing;

