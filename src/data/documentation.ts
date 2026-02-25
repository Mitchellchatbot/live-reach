export interface DocTopic {
  id: string;
  title: string;
  description: string;
  whatItDoes: string;
  howToUse: string[];
  tips: string[];
  relatedTopics?: { title: string; path: string }[];
}

export interface DocSection {
  id: string;
  title: string;
  description: string;
  topics: DocTopic[];
}

export const documentationSections: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of Scaled Bot',
    topics: [
      {
        id: 'overview',
        title: 'Overview',
        description: 'Welcome to Scaled Bot - your AI-powered customer support solution.',
        whatItDoes: 'Scaled Bot helps you provide instant, 24/7 customer support through an intelligent chat widget on your website. It combines AI automation with human agent support to ensure your visitors always get the help they need.',
        howToUse: [
          'Create your first property (website) from the dashboard',
          'Customize your chat widget appearance and behavior',
          'Add team members to handle conversations',
          'Configure AI personas for automated responses',
          'Embed the widget on your website'
        ],
        tips: [
          'Start with one property to learn the system before adding more',
          'Test your widget thoroughly before going live',
          'Monitor conversations regularly to improve AI responses'
        ],
        relatedTopics: [
          { title: 'Creating Properties', path: '/documentation/getting-started/properties' },
          { title: 'Widget Customization', path: '/documentation/widget/customization' },
          { title: 'Onboarding Flow', path: '/documentation/getting-started/onboarding' }
        ]
      },
      {
        id: 'properties',
        title: 'Creating Properties',
        description: 'Set up websites to manage with Scaled Bot.',
        whatItDoes: 'Properties represent the websites where you want to deploy chat support. Each property has its own widget settings, team assignments, and conversation history.',
        howToUse: [
          'Click "Add Property" from any property selector',
          'Enter your property name (e.g., "Main Website")',
          'Enter your domain (e.g., "example.com")',
          'Click "Create Property" to save'
        ],
        tips: [
          'Use descriptive names to easily identify properties',
          'You can manage multiple websites from one account',
          'Each property can have different widget colors and settings'
        ],
        relatedTopics: [
          { title: 'Widget Customization', path: '/documentation/widget/customization' },
          { title: 'Team Assignments', path: '/documentation/team/property-assignments' },
          { title: 'Business Info', path: '/documentation/account/business-info' }
        ]
      },
      {
        id: 'onboarding',
        title: 'Onboarding Flow',
        description: 'The guided setup wizard for new accounts.',
        whatItDoes: 'When you first sign up, the onboarding flow walks you through setting up your account step by step. You\'ll choose an AI personality tone, create your first property, and configure basic settings so you\'re ready to go.',
        howToUse: [
          'Sign up for a new account to start onboarding automatically',
          'Choose an AI tone preset (Emily, Michael, Daniel, or Sarah)',
          'Enter your business name and website domain',
          'Review the suggested base prompt and customize it',
          'Complete the wizard to land on your dashboard'
        ],
        tips: [
          'You can always change your AI tone and settings later in AI Support',
          'The onboarding wizard extracts info from your website to pre-fill settings',
          'If you skip onboarding, you can still set everything up manually from settings'
        ],
        relatedTopics: [
          { title: 'Overview', path: '/documentation/getting-started/overview' },
          { title: 'Dashboard Tour', path: '/documentation/getting-started/dashboard-tour' },
          { title: 'AI Tone Presets', path: '/documentation/ai-support/tone-presets' }
        ]
      },
      {
        id: 'dashboard-tour',
        title: 'Dashboard Tour',
        description: 'The interactive guided tour of your dashboard.',
        whatItDoes: 'After onboarding, an interactive guided tour highlights key areas of your dashboard. It walks you through the sidebar, inbox, AI settings, and other features with step-by-step tooltips so you know where everything is.',
        howToUse: [
          'The tour starts automatically after completing onboarding',
          'Follow the highlighted tooltips as they point to each feature',
          'Click "Next" to advance through tour steps',
          'Complete the tour to unlock a celebration confetti moment',
          'You can revisit the tour from the help menu if needed'
        ],
        tips: [
          'Don\'t skip the tour on your first visit — it covers features you might miss',
          'Each page may have its own deep-dive mini-tour',
          'The tour remembers your progress so you won\'t see it again once completed'
        ],
        relatedTopics: [
          { title: 'Onboarding Flow', path: '/documentation/getting-started/onboarding' },
          { title: 'Overview', path: '/documentation/getting-started/overview' }
        ]
      },
      {
        id: 'workspaces',
        title: 'Workspaces',
        description: 'Switch between and manage workspaces.',
        whatItDoes: 'Workspaces let you organize multiple businesses or client accounts under one login. Each workspace has its own properties, team members, and settings. You can switch between workspaces from the sidebar.',
        howToUse: [
          'Click the workspace switcher at the top of the sidebar',
          'Select an existing workspace to switch to it',
          'Click "Create Workspace" to set up a new one',
          'Each workspace has its own properties and team',
          'Your personal settings (profile, avatar) carry across all workspaces'
        ],
        tips: [
          'Use workspaces to separate different businesses or clients',
          'Agents can be invited to specific workspaces',
          'Switching workspaces is instant — no need to log out'
        ],
        relatedTopics: [
          { title: 'Creating Properties', path: '/documentation/getting-started/properties' },
          { title: 'Account Settings', path: '/documentation/account/account-settings' }
        ]
      }
    ]
  },
  {
    id: 'inbox',
    title: 'Inbox',
    description: 'Manage customer conversations',
    topics: [
      {
        id: 'conversations',
        title: 'Managing Conversations',
        description: 'View and respond to customer chats.',
        whatItDoes: 'The inbox shows all conversations from your websites. You can view active chats, respond to visitors, and close resolved conversations. Conversations are organized by status and property.',
        howToUse: [
          'Click on a conversation to open it in the chat panel',
          'Type your response in the message field',
          'Press Enter or click Send to deliver your message',
          'Use the close button to mark conversations as resolved'
        ],
        tips: [
          'Respond quickly - visitors may leave if they wait too long',
          'Use the visitor info panel to personalize your responses',
          'Closed conversations can be found in the Closed tab'
        ],
        relatedTopics: [
          { title: 'Visitor Information', path: '/documentation/inbox/visitor-info' },
          { title: 'Chat Panel', path: '/documentation/inbox/chat-panel' },
          { title: 'Conversation Status', path: '/documentation/inbox/conversation-status' }
        ]
      },
      {
        id: 'chat-panel',
        title: 'Chat Panel',
        description: 'The interface for messaging visitors.',
        whatItDoes: 'The chat panel displays the full conversation history with a visitor. You can see all messages, send replies, and view visitor details. The panel updates in real-time as new messages arrive.',
        howToUse: [
          'Select a conversation from the list to open it',
          'Scroll up to view previous messages',
          'Type in the message field at the bottom',
          'Press Enter to send, or Shift+Enter for a new line'
        ],
        tips: [
          'Messages from AI are labeled so you know what was automated',
          'You can see when visitors are typing',
          'The visitor info sidebar shows helpful context'
        ],
        relatedTopics: [
          { title: 'Managing Conversations', path: '/documentation/inbox/conversations' },
          { title: 'Conversation Shortcuts', path: '/documentation/inbox/shortcuts' },
          { title: 'Real-time Updates', path: '/documentation/inbox/realtime' }
        ]
      },
      {
        id: 'visitor-info',
        title: 'Visitor Information',
        description: 'Understanding your visitors.',
        whatItDoes: 'The visitor info panel shows details about who you\'re chatting with. This includes their name, email, phone, location, insurance info, current page, and any other information collected during the conversation.',
        howToUse: [
          'Open a conversation to see visitor details in the sidebar',
          'Click on expandable sections to see more info',
          'Use this context to personalize your responses'
        ],
        tips: [
          'Visitors provide more info when asked naturally in conversation',
          'Enable lead capture to collect contact details automatically',
          'Location is detected automatically based on IP address'
        ],
        relatedTopics: [
          { title: 'Lead Capture', path: '/documentation/ai-support/lead-capture' },
          { title: 'Visitor Leads', path: '/documentation/account/visitor-leads' }
        ]
      },
      {
        id: 'shortcuts',
        title: 'Conversation Shortcuts',
        description: 'Quick replies and chat shortcuts.',
        whatItDoes: 'Chat shortcuts let you quickly insert pre-written responses into conversations. Type a shortcut keyword (like "/hours" or "/thanks") and select from the matching suggestions to instantly send a common reply without typing it out every time.',
        howToUse: [
          'Open a conversation in the chat panel',
          'Type "/" in the message field to see all available shortcuts',
          'Continue typing to filter shortcuts by keyword',
          'Click a shortcut or press Enter to insert it',
          'Edit the inserted text if needed before sending'
        ],
        tips: [
          'Shortcuts save time on frequently asked questions',
          'You can customize your shortcuts to match your brand voice',
          'Combine shortcuts with personal touches for the best results'
        ],
        relatedTopics: [
          { title: 'Chat Panel', path: '/documentation/inbox/chat-panel' },
          { title: 'Managing Conversations', path: '/documentation/inbox/conversations' }
        ]
      },
      {
        id: 'realtime',
        title: 'Real-time Updates',
        description: 'Live conversation updates and indicators.',
        whatItDoes: 'Conversations update in real-time without needing to refresh. You\'ll see new messages appear instantly, typing indicators when someone is composing a message, and live status changes as conversations open or close.',
        howToUse: [
          'Open the inbox — conversations update automatically',
          'Watch for typing indicators showing a visitor is writing',
          'New messages appear instantly in the chat panel',
          'The conversation list re-sorts as new messages arrive',
          'Notification bells update in real-time for unread counts'
        ],
        tips: [
          'Keep the inbox open during business hours for fastest response',
          'Typing indicators help you know when to wait vs. respond',
          'Real-time updates work across all your open tabs'
        ],
        relatedTopics: [
          { title: 'Chat Panel', path: '/documentation/inbox/chat-panel' },
          { title: 'Conversation Status', path: '/documentation/inbox/conversation-status' }
        ]
      },
      {
        id: 'conversation-status',
        title: 'Conversation Status',
        description: 'Active, closed, and auto-close behavior.',
        whatItDoes: 'Conversations have three states: active (ongoing chat), closed (resolved), and pending. Stale conversations are automatically closed after a period of inactivity to keep your inbox clean. Closed conversations can be reopened if a visitor sends a new message.',
        howToUse: [
          'View active conversations in the "Active" tab of the inbox',
          'Click "Close" on a conversation to mark it resolved',
          'Stale conversations auto-close after ~45 seconds of inactivity',
          'Visitors reopening a closed chat automatically sets it back to active',
          'Use the "Closed" tab to review past conversations'
        ],
        tips: [
          'Auto-close keeps your inbox tidy without manual cleanup',
          'Visitors can always restart a closed conversation',
          'Closed conversations are still searchable in your history'
        ],
        relatedTopics: [
          { title: 'Managing Conversations', path: '/documentation/inbox/conversations' },
          { title: 'Real-time Updates', path: '/documentation/inbox/realtime' }
        ]
      }
    ]
  },
  {
    id: 'team',
    title: 'Team',
    description: 'Manage your support team',
    topics: [
      {
        id: 'inviting-agents',
        title: 'Inviting Agents',
        description: 'Add team members to handle conversations.',
        whatItDoes: 'Agents are team members who can respond to customer conversations. When you invite an agent, they receive an email with instructions to join your team and access the conversation dashboard.',
        howToUse: [
          'Go to Team Members from the sidebar',
          'Click the "Invite Agent" button',
          'Enter the agent\'s name and email address',
          'Select which properties they should have access to',
          'Click "Send Invitation" to invite them'
        ],
        tips: [
          'Agents receive an email invitation to join',
          'You can resend invitations if needed',
          'Assign agents to specific properties to organize workload'
        ],
        relatedTopics: [
          { title: 'Property Assignments', path: '/documentation/team/property-assignments' },
          { title: 'AI Personas', path: '/documentation/team/ai-personas' }
        ]
      },
      {
        id: 'property-assignments',
        title: 'Property Assignments',
        description: 'Control which websites agents can access.',
        whatItDoes: 'Property assignments determine which websites an agent can handle conversations for. This helps you organize your team when you have multiple websites or different specializations.',
        howToUse: [
          'Go to Team Members from the sidebar',
          'Find the agent you want to configure',
          'Click the properties dropdown in their row',
          'Check or uncheck properties to assign/unassign',
          'Changes save automatically'
        ],
        tips: [
          'Agents only see conversations from their assigned properties',
          'You can assign multiple agents to the same property',
          'Use this to create specialized teams for different websites'
        ],
        relatedTopics: [
          { title: 'Inviting Agents', path: '/documentation/team/inviting-agents' },
          { title: 'Creating Properties', path: '/documentation/getting-started/properties' }
        ]
      },
      {
        id: 'agent-avatars',
        title: 'Agent Avatars',
        description: 'Personalize agent profiles with photos.',
        whatItDoes: 'Avatars help visitors identify who they\'re chatting with. When an agent responds, their avatar appears next to their messages in the chat widget.',
        howToUse: [
          'Go to Team Members from the sidebar',
          'Click on an agent\'s avatar placeholder',
          'Select an image file from your computer',
          'The avatar uploads and saves automatically'
        ],
        tips: [
          'Use professional headshots for best results',
          'Square images work best (they\'ll be cropped to a circle)',
          'Keep file sizes reasonable for fast loading'
        ],
        relatedTopics: [
          { title: 'Inviting Agents', path: '/documentation/team/inviting-agents' },
          { title: 'AI Personas', path: '/documentation/team/ai-personas' }
        ]
      },
      {
        id: 'ai-personas',
        title: 'AI Personas',
        description: 'Create AI agents based on team members.',
        whatItDoes: 'AI personas are automated agents that can respond to conversations using AI. You can create them from scratch or base them on existing team members to maintain a consistent personality.',
        howToUse: [
          'Go to Team Members and find an agent',
          'Click the menu button and select "Create AI Persona"',
          'The AI persona is created with the agent\'s name and avatar',
          'Configure the persona in AI Support settings'
        ],
        tips: [
          'AI personas can handle conversations 24/7',
          'Link them to real agents for a seamless handoff experience',
          'Customize personality prompts in AI Support'
        ],
        relatedTopics: [
          { title: 'AI Personas Settings', path: '/documentation/ai-support/personas' },
          { title: 'Agent Avatars', path: '/documentation/team/agent-avatars' }
        ]
      }
    ]
  },
  {
    id: 'ai-support',
    title: 'AI Support',
    description: 'Configure automated AI responses',
    topics: [
      {
        id: 'personas',
        title: 'AI Personas',
        description: 'Create and manage AI agents.',
        whatItDoes: 'AI personas are automated agents that can greet visitors and respond to common questions. Each persona can have its own name, avatar, and personality to match your brand.',
        howToUse: [
          'Go to AI Support from the sidebar',
          'Click "Add AI Persona" to create a new one',
          'Enter a name and upload an avatar',
          'Add a personality prompt to define how it should respond',
          'Assign it to properties where it should be active'
        ],
        tips: [
          'Keep personality prompts specific and detailed',
          'Test your AI persona before going live',
          'You can have multiple personas for different purposes'
        ],
        relatedTopics: [
          { title: 'Base Prompt', path: '/documentation/ai-support/base-prompt' },
          { title: 'AI Tone Presets', path: '/documentation/ai-support/tone-presets' }
        ]
      },
      {
        id: 'behavior-settings',
        title: 'Behavior Settings',
        description: 'Control how AI responds to visitors.',
        whatItDoes: 'Behavior settings let you fine-tune how AI interacts with visitors. You can control response delays, typing indicator timing, words-per-minute speed, and other details to make conversations feel natural and human-like.',
        howToUse: [
          'Go to AI Support from the sidebar',
          'Select a property to configure',
          'Scroll to the Behavior Settings section',
          'Adjust response delay, typing speed, and indicator timing',
          'Click Save to apply changes'
        ],
        tips: [
          'Slower response times can feel more natural',
          'Enable smart typing for realistic typing indicators',
          'Test different settings to find what works best'
        ],
        relatedTopics: [
          { title: 'Typo Injection', path: '/documentation/ai-support/typo-injection' },
          { title: 'Quick Reply After First', path: '/documentation/ai-support/quick-reply' },
          { title: 'Escalation Rules', path: '/documentation/ai-support/escalation' }
        ]
      },
      {
        id: 'escalation',
        title: 'Escalation Rules',
        description: 'When AI should hand off to humans.',
        whatItDoes: 'Escalation rules determine when AI should stop responding and notify a human agent. This ensures complex or sensitive issues get proper attention from your team.',
        howToUse: [
          'Go to AI Support from the sidebar',
          'Find the Escalation section',
          'Toggle on Auto Escalation',
          'Set the maximum AI messages before escalation',
          'Add keywords that should trigger immediate escalation'
        ],
        tips: [
          'Add keywords for urgent issues like "emergency" or "cancel"',
          'Lower message limits mean faster human handoff',
          'Monitor escalated conversations to improve AI responses'
        ],
        relatedTopics: [
          { title: 'Behavior Settings', path: '/documentation/ai-support/behavior-settings' },
          { title: 'Managing Conversations', path: '/documentation/inbox/conversations' }
        ]
      },
      {
        id: 'lead-capture',
        title: 'Lead Capture',
        description: 'Collect visitor contact information.',
        whatItDoes: 'Lead capture settings determine what contact information to collect from visitors. You can require name, email, phone, or insurance card info before chatting, or use natural lead capture to ask during conversation.',
        howToUse: [
          'Go to AI Support from the sidebar',
          'Find the Lead Capture section',
          'Toggle on the fields you want to require (name, email, phone, insurance card)',
          'Choose between upfront forms or natural capture',
          'Click Save to apply changes'
        ],
        tips: [
          'Requiring too much info may discourage visitors',
          'Email is the most valuable field to capture',
          'Natural capture feels less intrusive to visitors'
        ],
        relatedTopics: [
          { title: 'Visitor Information', path: '/documentation/inbox/visitor-info' },
          { title: 'Visitor Leads', path: '/documentation/account/visitor-leads' },
          { title: 'Proactive Messages', path: '/documentation/ai-support/proactive-messages' }
        ]
      },
      {
        id: 'proactive-messages',
        title: 'Proactive Messages',
        description: 'Automatically engage visitors.',
        whatItDoes: 'Proactive messages automatically reach out to visitors after they\'ve been on your site for a set time. This can increase engagement and start more conversations.',
        howToUse: [
          'Go to AI Support from the sidebar',
          'Find the Proactive Messages section',
          'Toggle on proactive messaging',
          'Set the delay (seconds before sending)',
          'Write your proactive message',
          'Click Save to apply changes'
        ],
        tips: [
          'Keep messages friendly and helpful, not pushy',
          'Test different delays to find optimal timing',
          'Use questions to encourage responses'
        ],
        relatedTopics: [
          { title: 'Lead Capture', path: '/documentation/ai-support/lead-capture' },
          { title: 'Base Prompt', path: '/documentation/ai-support/base-prompt' }
        ]
      },
      {
        id: 'base-prompt',
        title: 'Base Prompt',
        description: 'Define core AI instructions.',
        whatItDoes: 'The base prompt is the foundation for all AI responses. It tells the AI who it is, what your business does, and how it should communicate with visitors.',
        howToUse: [
          'Go to AI Support from the sidebar',
          'Click "Edit Base Prompt" in the header',
          'Write instructions for your AI agent',
          'Include info about your business and services',
          'Click Save to apply changes'
        ],
        tips: [
          'Be specific about your products/services',
          'Include common FAQs and their answers',
          'Define the tone (friendly, professional, casual)',
          'Update regularly as your business changes'
        ],
        relatedTopics: [
          { title: 'AI Personas', path: '/documentation/ai-support/personas' },
          { title: 'AI Tone Presets', path: '/documentation/ai-support/tone-presets' }
        ]
      },
      {
        id: 'geo-filtering',
        title: 'Service Area / Geo-Filtering',
        description: 'Restrict AI support by geographic location.',
        whatItDoes: 'Geo-filtering lets you control which visitors can chat based on their location. You can set the mode to Global (everyone), US Only, or Specific States. Visitors outside your service area see a configurable blocked message instead of the chat.',
        howToUse: [
          'Go to AI Support from the sidebar',
          'Find the Service Area / Geo-Filtering section',
          'Choose a filter mode: Global, US Only, or Specific States',
          'If using Specific States, select the states you serve',
          'Customize the blocked visitor message',
          'Click Save to apply changes'
        ],
        tips: [
          'Use "US Only" if you only serve domestic customers',
          'The blocked message should be helpful — suggest alternatives or a phone number',
          'Visitor location is detected automatically via IP address'
        ],
        relatedTopics: [
          { title: 'Behavior Settings', path: '/documentation/ai-support/behavior-settings' },
          { title: 'Visitor Information', path: '/documentation/inbox/visitor-info' }
        ]
      },
      {
        id: 'typo-injection',
        title: 'Typo Injection',
        description: 'Humanize AI responses with natural typos.',
        whatItDoes: 'Typo injection adds occasional, natural-looking typos to AI responses to make them feel more human. This prevents the "too-perfect" robotic feel that can make visitors suspect they\'re talking to a bot.',
        howToUse: [
          'Go to AI Support from the sidebar',
          'Find the Humanization section under Behavior Settings',
          'Toggle on "Human Typos"',
          'The AI will automatically introduce subtle, realistic typos',
          'Click Save to apply changes'
        ],
        tips: [
          'Typos are subtle — they won\'t make messages unreadable',
          'Combine with response delays and smart typing for maximum realism',
          'Test a few conversations to see the effect before going live'
        ],
        relatedTopics: [
          { title: 'Drop Apostrophes', path: '/documentation/ai-support/drop-apostrophes' },
          { title: 'Behavior Settings', path: '/documentation/ai-support/behavior-settings' }
        ]
      },
      {
        id: 'quick-reply',
        title: 'Quick Reply After First',
        description: 'Fast reply mode after the first AI message.',
        whatItDoes: 'When enabled, the AI sends its first response with the normal delay to feel natural, but subsequent messages in the same conversation are sent much faster. This mimics how a real person types faster once they\'re engaged in a conversation.',
        howToUse: [
          'Go to AI Support from the sidebar',
          'Find "Quick Reply After First" in Behavior Settings',
          'Toggle it on',
          'The first message uses your configured delay; follow-ups are faster',
          'Click Save to apply changes'
        ],
        tips: [
          'This creates a natural conversation rhythm',
          'Works well with smart typing indicators',
          'Great for high-volume conversations where speed matters'
        ],
        relatedTopics: [
          { title: 'Behavior Settings', path: '/documentation/ai-support/behavior-settings' },
          { title: 'Typo Injection', path: '/documentation/ai-support/typo-injection' }
        ]
      },
      {
        id: 'drop-apostrophes',
        title: 'Drop Apostrophes',
        description: 'Casual tone by removing apostrophes.',
        whatItDoes: 'When enabled, the AI drops apostrophes from contractions (e.g., "don\'t" becomes "dont", "I\'m" becomes "Im"). This creates a more casual, texting-style tone that feels natural for informal conversations.',
        howToUse: [
          'Go to AI Support from the sidebar',
          'Find "Drop Apostrophes" in the Humanization section',
          'Toggle it on to enable the casual tone',
          'AI responses will automatically drop apostrophes',
          'Click Save to apply changes'
        ],
        tips: [
          'Best for brands with a casual, friendly voice',
          'Combine with typo injection for maximum informality',
          'Not recommended for formal or medical contexts — use your judgment'
        ],
        relatedTopics: [
          { title: 'Typo Injection', path: '/documentation/ai-support/typo-injection' },
          { title: 'Base Prompt', path: '/documentation/ai-support/base-prompt' }
        ]
      },
      {
        id: 'tone-presets',
        title: 'AI Tone Presets',
        description: 'Pre-built personality styles for your AI.',
        whatItDoes: 'AI tone presets give you ready-made personalities to choose from during onboarding. Each preset — Emily (warm & empathetic), Michael (professional & direct), Daniel (friendly & casual), Sarah (knowledgeable & supportive) — comes with a tailored base prompt and avatar.',
        howToUse: [
          'During onboarding, you\'ll see the four tone presets',
          'Click a preset to preview its personality and avatar',
          'Select the one that best matches your brand voice',
          'The chosen tone sets your initial base prompt and AI persona',
          'You can change or customize the tone anytime in AI Support settings'
        ],
        tips: [
          'Emily works great for healthcare and counseling businesses',
          'Michael suits professional services and B2B',
          'Daniel is ideal for casual consumer brands',
          'Sarah fits education and consulting contexts'
        ],
        relatedTopics: [
          { title: 'Base Prompt', path: '/documentation/ai-support/base-prompt' },
          { title: 'AI Personas', path: '/documentation/ai-support/personas' },
          { title: 'Onboarding Flow', path: '/documentation/getting-started/onboarding' }
        ]
      }
    ]
  },
  {
    id: 'widget',
    title: 'Widget',
    description: 'Customize and embed your chat widget',
    topics: [
      {
        id: 'customization',
        title: 'Widget Customization',
        description: 'Make the widget match your brand.',
        whatItDoes: 'Customize how your chat widget looks on your website. You can change colors, icon style, greeting message, and offline message to match your brand identity.',
        howToUse: [
          'Go to Widget from the sidebar',
          'Select the property to customize',
          'Choose a widget icon style and primary color',
          'Set your greeting and offline messages',
          'Preview changes in real-time'
        ],
        tips: [
          'Use your brand colors for consistency',
          'Test on both mobile and desktop views',
          'Keep the widget visible but not intrusive'
        ],
        relatedTopics: [
          { title: 'Colors & Branding', path: '/documentation/widget/colors-branding' },
          { title: 'Widget Effects', path: '/documentation/widget/effects' },
          { title: 'Embed Code', path: '/documentation/widget/embed-code' }
        ]
      },
      {
        id: 'colors-branding',
        title: 'Colors & Branding',
        description: 'Match widget colors to your brand.',
        whatItDoes: 'Set custom colors for your chat widget. You can auto-extract colors from your website or manually set them to match your brand guidelines.',
        howToUse: [
          'Go to Widget from the sidebar',
          'Click "Auto-extract from website" to pull brand colors',
          'Or manually set primary, text, and border colors',
          'Use the color pickers to fine-tune',
          'Preview changes before saving'
        ],
        tips: [
          'Ensure good contrast for readability',
          'Test colors on different backgrounds',
          'Consider both light and dark themes'
        ],
        relatedTopics: [
          { title: 'Widget Customization', path: '/documentation/widget/customization' },
          { title: 'Style Presets', path: '/documentation/widget/style-presets' }
        ]
      },
      {
        id: 'style-presets',
        title: 'Style Presets',
        description: 'Quick-start with pre-made styles.',
        whatItDoes: 'Style presets are pre-configured widget designs that you can apply instantly. Choose from modern, classic, minimal, bold, or soft styles.',
        howToUse: [
          'Go to Widget from the sidebar',
          'Click on a style preset card',
          'The widget preview updates immediately',
          'Customize further if needed',
          'Save when you\'re happy with the look'
        ],
        tips: [
          'Presets are a great starting point',
          'You can customize any preset further',
          'Match the style to your website design'
        ],
        relatedTopics: [
          { title: 'Colors & Branding', path: '/documentation/widget/colors-branding' },
          { title: 'Widget Customization', path: '/documentation/widget/customization' }
        ]
      },
      {
        id: 'embed-code',
        title: 'Embed Code',
        description: 'Add the widget to your website.',
        whatItDoes: 'The embed code is a small snippet of JavaScript that you add to your website to display the chat widget. Once added, the widget appears automatically on all pages.',
        howToUse: [
          'Go to Widget from the sidebar',
          'Switch to the "Embed Code" tab',
          'Copy the code snippet',
          'Paste it before the closing </body> tag on your website',
          'Save and publish your website changes'
        ],
        tips: [
          'Add the code to your website template for all pages',
          'Test on a staging site before going live',
          'The widget loads asynchronously and won\'t slow your site'
        ],
        relatedTopics: [
          { title: 'Widget Customization', path: '/documentation/widget/customization' },
          { title: 'Creating Properties', path: '/documentation/getting-started/properties' }
        ]
      },
      {
        id: 'effects',
        title: 'Widget Effects',
        description: 'Add visual animations to attract attention.',
        whatItDoes: 'Widget effects add eye-catching animations to your chat button — like a bounce, pulse, glow, or shake — to draw visitor attention. You can control the effect type, intensity, and how often it triggers.',
        howToUse: [
          'Go to Widget from the sidebar',
          'Find the Widget Effects section',
          'Choose an effect type (bounce, pulse, glow, shake, etc.)',
          'Set the intensity (subtle, medium, strong)',
          'Set the interval (how often the effect plays in seconds)',
          'Click Save to apply'
        ],
        tips: [
          'Subtle effects are less annoying and still effective',
          'Use a longer interval so the animation isn\'t constant',
          'Test effects on your actual website to see how they look in context'
        ],
        relatedTopics: [
          { title: 'Widget Customization', path: '/documentation/widget/customization' },
          { title: 'Widget Preview', path: '/documentation/widget/preview' }
        ]
      },
      {
        id: 'preview',
        title: 'Widget Preview',
        description: 'Test your widget before going live.',
        whatItDoes: 'The widget preview page shows you exactly how your chat widget will look and behave on a real page. You can interact with it, test conversations, and see how it renders on different backgrounds — all without deploying to your website.',
        howToUse: [
          'Go to Widget from the sidebar',
          'Click "Preview Widget" or navigate to the preview page',
          'Interact with the widget to test its behavior',
          'Check how it looks with your current color and effect settings',
          'Make adjustments in the widget settings and refresh to see changes'
        ],
        tips: [
          'Use preview to test conversations end-to-end before embedding',
          'Check both mobile and desktop views',
          'Preview is great for demoing the widget to stakeholders'
        ],
        relatedTopics: [
          { title: 'Widget Effects', path: '/documentation/widget/effects' },
          { title: 'Embed Code', path: '/documentation/widget/embed-code' }
        ]
      }
    ]
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect with other tools',
    topics: [
      {
        id: 'salesforce',
        title: 'Salesforce',
        description: 'Export leads to Salesforce CRM.',
        whatItDoes: 'Connect Scaled Bot to your Salesforce account via OAuth to automatically export visitor information as leads. Map conversation data to Salesforce fields and configure auto-export triggers for escalations, phone submissions, or conversation endings.',
        howToUse: [
          'Go to Salesforce from the sidebar',
          'Click "Connect to Salesforce" to start the OAuth flow',
          'Authorize Scaled Bot in the Salesforce login window',
          'Once connected, configure field mappings (name, email, phone, etc.)',
          'Enable auto-export triggers: on escalation, phone detected, conversation end',
          'Test with a manual export before relying on auto-export'
        ],
        tips: [
          'You\'ll need a Salesforce Connected App with OAuth enabled',
          'Map all relevant fields for complete lead data',
          'Use auto-export on escalation to capture high-intent leads immediately',
          'Check the Salesforce settings page to see your connection status'
        ],
        relatedTopics: [
          { title: 'Lead Capture', path: '/documentation/ai-support/lead-capture' },
          { title: 'Visitor Leads', path: '/documentation/account/visitor-leads' }
        ]
      },
      {
        id: 'slack',
        title: 'Slack',
        description: 'Get notifications in Slack.',
        whatItDoes: 'Connect Slack via OAuth to receive real-time notifications about new conversations, escalations, and phone submissions. Notifications are posted to your chosen Slack channel with visitor details and conversation context.',
        howToUse: [
          'Go to Notifications from the sidebar',
          'Click "Add to Slack" to start the OAuth flow',
          'Authorize Scaled Bot in the Slack consent screen',
          'A default channel is selected automatically',
          'Toggle which events trigger Slack notifications (new chats, escalations, phone submissions)',
          'Click Save to apply changes'
        ],
        tips: [
          'Use a dedicated channel like #customer-chats for notifications',
          'Enable escalation alerts so urgent issues aren\'t missed',
          'You can disconnect and reconnect anytime from the settings page',
          'Test the connection with a test conversation after connecting'
        ],
        relatedTopics: [
          { title: 'Email Notifications', path: '/documentation/integrations/email' },
          { title: 'Escalation Rules', path: '/documentation/ai-support/escalation' }
        ]
      },
      {
        id: 'email',
        title: 'Email Notifications',
        description: 'Get alerts and track delivery.',
        whatItDoes: 'Configure email notifications to alert team members about new conversations, escalations, or phone submissions. You can add multiple recipient email addresses and view a notification log showing delivery status and any errors.',
        howToUse: [
          'Go to Notifications from the sidebar',
          'Switch to the Email tab',
          'Toggle email notifications on',
          'Add email addresses to the recipient list',
          'Choose which events trigger notifications',
          'View the Notification Log to track delivery status',
          'Click Save to apply'
        ],
        tips: [
          'Add backup email addresses for coverage',
          'Check the notification log if emails aren\'t arriving',
          'Failed deliveries show error messages in the log',
          'Don\'t over-notify — focus on escalation and phone submissions'
        ],
        relatedTopics: [
          { title: 'Slack Notifications', path: '/documentation/integrations/slack' },
          { title: 'Escalation Rules', path: '/documentation/ai-support/escalation' }
        ]
      }
    ]
  },
  {
    id: 'compliance',
    title: 'Compliance',
    description: 'HIPAA, data retention, and audit logging',
    topics: [
      {
        id: 'hipaa-settings',
        title: 'HIPAA Settings',
        description: 'Configure data protection and compliance.',
        whatItDoes: 'HIPAA settings let you configure data retention policies, session timeouts, and audit logging to meet healthcare compliance requirements. You can set how long visitor data and conversations are kept before automatic purging, and enforce session timeouts for inactive users.',
        howToUse: [
          'Go to HIPAA Compliance from the sidebar',
          'Select the property to configure',
          'Set the data retention period (in days)',
          'Toggle auto-purge on to automatically delete expired data',
          'Configure session timeout duration in Account Settings',
          'Review audit logs to track data access'
        ],
        tips: [
          'Consult your compliance officer before setting retention periods',
          'Shorter retention periods reduce risk but limit historical data',
          'Session timeouts add an extra layer of security for shared workstations',
          'A Business Associate Agreement (BAA) may be required for full HIPAA compliance'
        ],
        relatedTopics: [
          { title: 'Data Purging', path: '/documentation/compliance/data-purging' },
          { title: 'Audit Log', path: '/documentation/compliance/audit-log' },
          { title: 'Account Settings', path: '/documentation/account/account-settings' }
        ]
      },
      {
        id: 'data-purging',
        title: 'Data Purging',
        description: 'Automatic deletion of expired data.',
        whatItDoes: 'When auto-purge is enabled, the system automatically deletes conversations, messages, and visitor data that are older than your configured retention period. This runs on a schedule so you don\'t need to manually clean up old data.',
        howToUse: [
          'Go to HIPAA Compliance from the sidebar',
          'Set your desired retention period (e.g., 90 days)',
          'Toggle "Auto Purge" on',
          'The system will automatically delete data older than the retention period',
          'Check "Last Purge" timestamp to verify it\'s running'
        ],
        tips: [
          'Export any important data before enabling auto-purge',
          'The purge runs automatically — you don\'t need to trigger it',
          'Deleted data cannot be recovered, so choose retention periods carefully',
          'You can disable auto-purge at any time without losing current data'
        ],
        relatedTopics: [
          { title: 'HIPAA Settings', path: '/documentation/compliance/hipaa-settings' },
          { title: 'Visitor Leads', path: '/documentation/account/visitor-leads' }
        ]
      },
      {
        id: 'audit-log',
        title: 'Audit Log',
        description: 'Track who accessed what and when.',
        whatItDoes: 'The audit log records every time a team member views, updates, exports, or deletes visitor data or conversations. It captures who performed the action, what was accessed, which PHI fields were involved, and when it happened — essential for compliance audits.',
        howToUse: [
          'Audit logging happens automatically when users access visitor data',
          'View, update, export, and delete actions on visitors, conversations, and messages are logged',
          'Each log entry includes user ID, email, action type, resource, and timestamp',
          'PHI fields accessed (name, email, phone, insurance) are tracked specifically',
          'Logs can be reviewed by administrators for compliance reporting'
        ],
        tips: [
          'Audit logs are created automatically — no setup needed',
          'Review logs periodically to ensure data access follows your policies',
          'Logs include IP address and user agent for additional context',
          'Audit data is retained independently from conversation data retention settings'
        ],
        relatedTopics: [
          { title: 'HIPAA Settings', path: '/documentation/compliance/hipaa-settings' },
          { title: 'Visitor Information', path: '/documentation/inbox/visitor-info' }
        ]
      }
    ]
  },
  {
    id: 'account',
    title: 'Account',
    description: 'Manage your account and billing',
    topics: [
      {
        id: 'subscription',
        title: 'Subscription & Billing',
        description: 'Manage your plan and payments.',
        whatItDoes: 'The subscription page shows your current plan, usage, and billing details. You can upgrade, downgrade, or manage your subscription from here.',
        howToUse: [
          'Go to Subscription from the sidebar',
          'View your current plan and features',
          'Click "Upgrade" or "Change Plan" to switch plans',
          'Review usage metrics to see if you need more capacity',
          'Manage payment methods and billing history'
        ],
        tips: [
          'Check your usage before upgrading to make sure you need more capacity',
          'Annual plans offer significant savings over monthly billing',
          'Downgrading takes effect at the end of your current billing cycle'
        ],
        relatedTopics: [
          { title: 'Account Settings', path: '/documentation/account/account-settings' },
          { title: 'Business Info', path: '/documentation/account/business-info' }
        ]
      },
      {
        id: 'account-settings',
        title: 'Account Settings',
        description: 'Profile, email, password, and session management.',
        whatItDoes: 'Account settings let you update your personal profile (name, avatar, email), change your password, and configure session timeout duration. Session timeouts automatically log you out after a period of inactivity for security.',
        howToUse: [
          'Go to Account Settings from the sidebar',
          'Update your name, email, or avatar',
          'Change your password from the security section',
          'Set session timeout duration (in minutes)',
          'Click Save to apply changes'
        ],
        tips: [
          'Use a professional avatar — it appears in conversations and team views',
          'Shorter session timeouts are more secure, especially on shared computers',
          'Email changes may require verification',
          'Your profile carries across all workspaces'
        ],
        relatedTopics: [
          { title: 'Subscription & Billing', path: '/documentation/account/subscription' },
          { title: 'Workspaces', path: '/documentation/getting-started/workspaces' },
          { title: 'HIPAA Settings', path: '/documentation/compliance/hipaa-settings' }
        ]
      },
      {
        id: 'business-info',
        title: 'Business Info / Properties',
        description: 'Manage property details and website info.',
        whatItDoes: 'Business info settings let you add and update details about each property — business name, description, address, phone, email, hours, logo, and Calendly link. You can also auto-extract business info from your website domain to pre-fill these fields.',
        howToUse: [
          'Go to Settings from the sidebar and select "Business Info"',
          'Select the property to configure',
          'Fill in business details (name, phone, email, address, hours)',
          'Click "Extract from Website" to auto-fill from your domain',
          'Upload a business logo',
          'Add a Calendly URL for appointment scheduling',
          'Click Save to apply changes'
        ],
        tips: [
          'Complete business info helps the AI give more accurate answers',
          'The website extraction feature pulls info from your homepage automatically',
          'Keep business hours up to date for accurate offline messages',
          'Your Calendly link can be shared by the AI during conversations'
        ],
        relatedTopics: [
          { title: 'Creating Properties', path: '/documentation/getting-started/properties' },
          { title: 'Base Prompt', path: '/documentation/ai-support/base-prompt' }
        ]
      },
      {
        id: 'visitor-leads',
        title: 'Visitor Leads',
        description: 'View and manage captured visitor data.',
        whatItDoes: 'The visitor leads table shows all visitors who have chatted with your widget, along with their captured contact info (name, email, phone, insurance, location). You can search, filter, and export this data for follow-up or CRM import.',
        howToUse: [
          'Go to Settings and select "Visitor Leads"',
          'Select a property to view its visitors',
          'Browse the table of captured leads with contact details',
          'Use search to find specific visitors',
          'Export leads for use in external tools or CRM'
        ],
        tips: [
          'Leads are captured automatically during conversations',
          'Enable natural lead capture in AI Support for the best results',
          'Export to Salesforce directly using the Salesforce integration',
          'Check leads regularly to follow up on high-intent visitors'
        ],
        relatedTopics: [
          { title: 'Lead Capture', path: '/documentation/ai-support/lead-capture' },
          { title: 'Salesforce', path: '/documentation/integrations/salesforce' },
          { title: 'Visitor Information', path: '/documentation/inbox/visitor-info' }
        ]
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Track performance and insights',
    topics: [
      {
        id: 'overview',
        title: 'Analytics Overview',
        description: 'Understanding your chat performance.',
        whatItDoes: 'Analytics show you how your chat widget is performing. Track conversation counts, visitor engagement, AI vs human response rates, and resolution times to understand how well your support is working.',
        howToUse: [
          'Go to Analytics from the sidebar',
          'Select a property to view its data',
          'Review charts and metrics',
          'Use date ranges to compare periods',
          'Export data if needed'
        ],
        tips: [
          'Check analytics regularly to spot trends',
          'Compare weekday vs weekend performance',
          'Use insights to improve AI responses'
        ],
        relatedTopics: [
          { title: 'Page Analytics', path: '/documentation/analytics/page-analytics' },
          { title: 'Blog Analytics', path: '/documentation/analytics/blog-analytics' },
          { title: 'Conversation Metrics', path: '/documentation/analytics/conversation-metrics' }
        ]
      },
      {
        id: 'page-analytics',
        title: 'Page Analytics',
        description: 'Per-page visitor tracking and engagement.',
        whatItDoes: 'Page analytics track which pages on your website get the most visitors and engagement. See page views, unique visitors, and which pages drive the most chat conversations — helping you understand where visitors need the most help.',
        howToUse: [
          'Go to Analytics from the sidebar',
          'Select the "Page Analytics" tab or section',
          'View per-page metrics including views and engagement',
          'Sort by most visited or most conversations started',
          'Use this data to optimize widget placement and content'
        ],
        tips: [
          'Pages with high traffic but low engagement may need better content',
          'Consider adding proactive messages on high-intent pages',
          'Page analytics require the widget embed code on each page'
        ],
        relatedTopics: [
          { title: 'Analytics Overview', path: '/documentation/analytics/overview' },
          { title: 'Blog Analytics', path: '/documentation/analytics/blog-analytics' }
        ]
      },
      {
        id: 'blog-analytics',
        title: 'Blog Analytics',
        description: 'Track blog and content performance.',
        whatItDoes: 'Blog analytics give you insights into how your blog content performs in driving visitor engagement and chat conversations. Track which blog posts get the most views and which ones lead to the most support interactions.',
        howToUse: [
          'Go to Analytics from the sidebar',
          'Select the "Blog Analytics" tab or section',
          'View performance metrics for your blog content',
          'Identify top-performing posts by engagement',
          'Use insights to guide your content strategy'
        ],
        tips: [
          'High-engagement blog posts are great candidates for proactive chat messages',
          'Track which topics generate the most support questions',
          'Use blog analytics to improve your FAQ and base prompt content'
        ],
        relatedTopics: [
          { title: 'Page Analytics', path: '/documentation/analytics/page-analytics' },
          { title: 'Analytics Overview', path: '/documentation/analytics/overview' }
        ]
      },
      {
        id: 'conversation-metrics',
        title: 'Conversation Metrics',
        description: 'AI vs human response rates and resolution.',
        whatItDoes: 'Conversation metrics break down how your conversations are handled — what percentage are fully resolved by AI vs escalated to humans, average response times, and resolution rates. This helps you measure AI effectiveness and team workload.',
        howToUse: [
          'Go to Analytics from the sidebar',
          'View the conversation metrics section',
          'Review AI resolution rate vs human escalation rate',
          'Check average response times for AI and human agents',
          'Monitor trends over time to measure improvements'
        ],
        tips: [
          'A high AI resolution rate means your base prompt and FAQs are working well',
          'If escalation rate is high, review and improve your AI base prompt',
          'Compare response times to set realistic expectations for visitors',
          'Use these metrics in team reviews and planning'
        ],
        relatedTopics: [
          { title: 'Analytics Overview', path: '/documentation/analytics/overview' },
          { title: 'Escalation Rules', path: '/documentation/ai-support/escalation' },
          { title: 'Behavior Settings', path: '/documentation/ai-support/behavior-settings' }
        ]
      }
    ]
  }
];

export function getSection(sectionId: string): DocSection | undefined {
  return documentationSections.find(s => s.id === sectionId);
}

export function getTopic(sectionId: string, topicId: string): DocTopic | undefined {
  const section = getSection(sectionId);
  return section?.topics.find(t => t.id === topicId);
}

export function getAllTopics(): { section: DocSection; topic: DocTopic }[] {
  const all: { section: DocSection; topic: DocTopic }[] = [];
  for (const section of documentationSections) {
    for (const topic of section.topics) {
      all.push({ section, topic });
    }
  }
  return all;
}
