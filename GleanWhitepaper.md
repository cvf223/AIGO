Glean Agents
A technical white pap er describing the
design of Glean Agents that autonomously
execute against a user-define d goal by
choosing workflows, utilizing tools, and
learning continuously.
Authors
Chau Tran
Julie MillsTable of contents
Intro duction to agents 3
Agents
Task-base d agents
Conversational agents
4
4
5
Agent-to-agent interactions
6
Workflows
7
Tools
8
Memory
9
Mo dels
10
Glean’s agentic reasoning engine 11
Task-base d agents: Building agents using
natural language
13
Conversational agents: Moving b etween fast
search and advance d reasoning
16
Tools: Building a scalable tools framework
Read tools
Glean search
Glean example: Personal knowle dge graph
19
20
20
21Table of contents
Data analysis
Structure d data analysis
Unstructure d data analysis
Glean example: Data analysis query
Write tools
Glean actions
Glean Example: IT service desk ticket
Glean MCP supp ort
Designing for L L M choice
Evaluating agents
Glean example: People seeking query
evaluations
Glean’s agentic reasoning engine scales
with search
24
24
24
25
27
27
28
31
33
35
37
39Intro duction to agents
Reasoning is fundamental to human intelligence, enabling us to
tackle novel, complex problems. We refine our reasoning through
exp erience, creating a fee dback loop where each decision informs
the next. Over time, this cycle sharp ens our ability to break down
challenges and achieve mastery in a domain.
Generative AI in the enterprise follows a similar trajectory. While
Large Language Mo dels (L L Ms) have reache d the p oint where they
can solve math, science, and co ding problems, reasoning alone
isn’t enough. L L Ms nee d enterprise context and tools to take
meaningful action. This is where agents come in—they extend
L L Ms by integrating with external tools, retrieving relevant
information, and adapting to dynamic environments.
Agents don’t just process information; they plan, execute, and
iterate. They break tasks into steps, pull in the right tools, and
refine their approach base d on outcomes. Just like humans, they
learn from past actions, adjusting workflows, broadening their
toolset, and improving decision-making over time.
Glean 3Agents
Agents are systems that autonomously execute against a user-
define d goal by choosing workflows, utilizing tools, and learning
continuously. While there are several flavors of agents, at Glean
we focus on the concept of task-base d agents and
conversational agents as each focuses on a different interaction
mo de.
Task-base d agents
Task-base d agents dynamically apply company knowle dge to
optimize work. For example, a task-base d agent can compare
rep orts against past approvals, sp ending patterns, and company
p olicies to autonomously determine which exp enses to approve.
Task-base d agents are not the same as business process
automation (BPA) which is characterize d by static, rigid
processes and an attachment to critical departmental workflows.
BPA systems emulate machine automation, focusing on rep etitive
tasks without considering the human element involve d in the
work. In the example of exp ense rep orts, a BPA system may flag
rep orts for errors and escalate them to managers but cannot
make autonomous or semi-autonomous decisions. Task-base d
agents can accelerate exp ense processing without much manual
human intervention, with guardrails ensuring oversight for high-
value transactions.
Glean 4Conversational agents
Conversational agents go b eyond automation by engaging users
in strategic decision-making rather than just executing
pre define d tasks. Let’s take the example of a conversational
agent that assists a sales representative by analyzing past deals,
comp etitor strategies, and customer engagement patterns to
surface common objections and successful negotiation tactics.
Instead of following a rigid sales playb ook, the agent collab orates
with the sales representative, refining the negotiation strategy
base d on continuous fee dback. They also p ersonalize the
exp erience to that sales representative, taking into account their
own winning strategies and style.
Agents take a dynamic approach, treating each task as unique
and adapting to varying contexts, including each user's individual
preferences and workflows. This adaptability makes them
particularly suite d for knowle dge workers engage d in diverse and
creative tasks.
Glean 5Agent-to-agent interactions
Just like how teams collab orate—bringing unique p ersp ectives,
aligning on the direction, and then executing their individual parts
—agents can do the same. Agents don’t have to work in isolation;
they can tap into knowle dge from internal and external agents.
For example, a supp ort agent may b e taske d with resolving a user
issue within a short timeframe. However, if the issue re quires
deep er investigation, it may b e escalate d to an engineering agent
for additional work. This engineering effort could extend b eyond
the lifespan of the original supp ort ticket, prompting b oth agents
to collab orate—delivering a short-term resolution to the customer
while coordinating a longer-term fix. This scenario highlights the
p ower of agent collab oration: multiple agents can op erate in
parallel, each focuse d on its sp ecific scop e, while working
together to deliver the b est outcome for the customer.
In the very near future, every SaaS application will likely have
agents, but it’s the platforms that enable agent-to-agent
collab oration that stand to break down the silos that have long
fragmente d enterprise software.
Glean 6Workflows
Workflows provide the structure d blueprint for executing
processes, as well as defining steps, tools, and actions. You can
think of a workflow like you would a process map in your
organization. Workflows aim to get agents as close as p ossible to
b eing deterministic or following pre define d logic.
Agents can follow the structure d process laid out in the workflow
while adapting within pre define d parameters base d on context
and decision rules. They don’t change freely but can adjust
steps, paths, or outcomes base d on sp ecific conditions. This can
b e seen in a customer supp ort workflow that automatically
escalates high-priority tickets while routing lower-priority ones
through standard queues.
Agents and workflows op erate in a symbiotic system, combining
structure with adaptability. Workflows serve as the process
knowle dge base of an organization, defining how work gets done
across departments. Agents leverage a library of workflows to
determine how to efficiently execute tasks, following pre define d
processes while adapting base d on real-time context.
Glean 7Tools
L L Ms p ossess reasoning, but aren’t traine d on enterprise tools—
they can’t query databases or take direct actions in external
systems. Tools bridge this gap, allowing L L Ms to interact with
enterprise environments effectively. There are three typ es of
tools in agentic systems?
Read to ols: Query data from multiple external systems to provide
enterprise context
Write to ols: Mo dify data or trigger processes in source
applications
Workflows: Leverage enterprise processes to inform decision-
making.
To b e effective, tools must b e b oth sp ecialize d and comp osable
like a Swiss Army knife, where each tool serves a function,
combining them creates something that is greater than the sum
of each part. By chaining tools together, agents can move
b eyond basic automation to make context-aware decisions and
drive adaptive enterprise workflows.
Glean 8Memory
As humans make decisions, we constantly store new insights in
our memory. These insights are use d as inputs to help us refine
our reasoning and strategy over time. This accumulate d
knowle dge, in a business context, b ecomes essential for b oth
exp ertise and p erformance.
Similarly, in agentic systems, memory functions as the learning
from continuous fee dback. This memory is shap e d by b oth self-
reflection (where agents analyze the success of their actions)
and human fee dback (which intro duces a layer of p ersonalization
and sp ecialization). The ability to incorp orate human fee dback is
a necessary element, as it allows agents to adapt to individual
work styles and domain-sp ecific re quirements.
On a broader scale, memory and fee dback mechanisms help
maintain the diversity of human exp ertise within agentic
systems. Without this capability, agents risk standardizing
outputs, which can stifle the creativity and sp ecialization that
diverse workforces bring.
Glean 9Mo dels
L L Ms continue to make strides in reasoning capabilities by fine-
tuning on sp ecific mathematical and scientific datasets. They
use reinforcement learning to iteratively self-train, and adopt
chain-of-thought problem solving to break down complex tasks
into multiple smaller steps. Advancements in mo del reasoning are
a prere quisite for agentic AI but alone are insufficient for
enterprise agent systems. Enterprise AI re quires the adoption of
techniques such as*
) Retrieval-augmente d generation (RAG): Ground resp onses in
enterprise data>
) Workflows: Ground agents in organizational process knowle dge>
) To ol utilization: Connect to the enterprise ecosystem of tools to
take action>
) Memory: Rememb er past interactions and preferences.@
) Evaluation: Assess and refine agents on enterprise-sp ecific
query patterns.
We’ll review how each of these techniques is implemente d in
Glean’s agentic reasoning engine.
Glean 10Glean’s agentic
reasoning engine
An agentic reasoning engine is designe d to replicate the human
decision-making process—from understanding goals to planning
steps, executing actions, and evaluating results. Achieving this level
of reasoning in enterprise environments involves the following steps:
` Query assessment: Decides how to approach the task and makes a
routing decision—either direct execution using a single tool or
escalation to multi-step planning.R
` Planning: Glean maps out how to solve the task and output a
structure d plan with logical steps, the tools and sub-agents to use,
and when to use them=
` Exe cution: Carries out the plan by integrating tools at each step,
while allowing flexibility to adapt base d on real-time outputs. Provide
time during execution for interme diate reasoning, allowing mo dels to
think ab out the problem b efore executing on it=
` Resp onse: Generates a resp onse, which could b e a natural language
explanation, an action, or a decision within an enterprise application.
Glean 11Agentic engines re quire b oth deep capabilities in tools, workflows,
and planning as well as effective orchestration to manage
handoffs.
Q u e r y
Ask anything about work
L L M
3 rd p a r t y a g e n t s
R e s p o n d
S e a rc h R e f l e ct P l a n
P l a n
E xe c u te
S te p
S te p
Assistant
S te p
Wo r kf l o w s S te p
S u b - a g e n t s
To o l s :
Search, Data analysis, Reason,
Calendar, Email, Exp ert search,
Employee search, Web search
A g e n t i c re a s o n i n g
H y b r i d s e a rc h
Ranking
Permissions validation
Knowledge graph Self-learning language model
Conne ctors Analytics
100+ applications Indexing API
Lexical search algorithm
Analytics
Glean’s agentic reasoning engine
Glean 12Task-base d agents: Building agents
using natural language
Glean’s agent builder takes natural language instructions and
converts them into multi-step workflows.
When building a new workflow, Glean Agents take into
consideration the library of existing agents, tools, and workflows
that are b oth system generate d and sp ecific to the enterprise.
The agentic reasoning engine first searches for a numb er of
similar workflow examples, leveraging existing process knowle dge
to establish new processes. These examples are then provide d as
demonstrating (few-shot) examples to the L L M. This enables
agents to handle unfamiliar tasks accurately without nee ding
large, task-sp ecific datasets.
The key question then b ecomes: which high-quality workflows
should agents learn from and replicate? Glean addresses this
challenge with workflow search, surfacing the most relevant
workflows to guide agent b ehavior. Workflow search goes b eyond
simple vector search, or the identification of similar workflows
base d on semantic understanding, to incorp orate signals
including past success rates, workflow usage, recency, and
workflow creator authority. By creating workflow search base d on
a hybrid search architecture, incorp orating b oth key word and
semantic search, as well as p opularity signals, Glean is able to
provide b etter curate d data for workflow creation.
Glean 13After reviewing a few example workflows, Glean Agents b egin
designing their own workflow for the task at hand—leveraging
b oth branching and looping logic. Branching uses b oolean logic to
explore multiple p ossible paths, helping agents adapt base d on
the situation. Looping, on the other hand, allows for steps in the
workflow to rep eat and L L Ms to iteratively refine their outputs.
This process helps the mo del explore multiple alternatives and
converge on more accurate, contextually relevant solutions.
Routing is use d to direct steps in the workflow to sub-agents,
thereby adding sp ecialize d exp ertise. Sub-agents are b eneficial in
that they create a layer of abstraction- rather than defining all of
the work upfront, some degree of planning can b e consume d by
the sub-agent. By delegating steps to sub-agents, we instill clear
lines of ownership and streamline handoffs.
The deterministic agent output, the workflow, helps Glean to
evaluate agent p erformance in the enterprise. We evaluate a
workflow base d on human fee dback, downvotes and upvotes in
the pro duct, as well as the p ositive interaction rate of workflows
themselves. We also create a p ool of golden workflows, or the
b est p erforming workflows at a system level, that have a high
degree of diversity and supp ort horizontal enterprise AI.
Glean 14Glean users create a task-base d agent by describing the steps re quire d
to complete the work in natural language. The agent is automatically
generate d base d on those steps.
The Glean Agent executes a se quence of steps, such as retrieving
information, reasoning through the task, or taking action in a business
application. Agents are triggere d on a sche dule, in resp onse to an
event, or manually.
Glean 15Conversational agents:
Moving b etween fast search and
advance d reasoning
Glean Assistant is a conversational agent that excels at search,
content creation, analysis, and more. Designe d to b oost
pro ductivity, it learns your preferences and p ersonalizes interactions
base d on your role and conversation history.
When a user asks a question, Glean’s agentic reasoning engine
dynamically interprets the task and adjusts its execution—opting for
fast, single-step actions on simple tasks or on-the-fly advance d
reasoning for more complex scenarios. This design optimizes for
p erformance and latency as Assistant users are looking for a back-
and-forth, real-time interaction.
F a s t exe c u t i o n M u l t i - s te p exe c u t i o n
A g e n t i c S e a rc h re a s o n i n g
R e f l e ct
R e s p o n d
A n s w e r w o u l d
b e n e f i t f ro m a n d w o r k f l o w s
to o l s
P l a n
Q u e r y re w r i te
M u l t i - s te p p l a n
E xe c u te
S te p
S te p
Assistant
S te p
S te p
Wo r k f l o w s S u b - a g e n t s
To o l s :
Search, Data analysis, Reason,
Calendar, Email, Exp ert search,
Employee search, Web search
S e a rc h a n s w e r i s o p t i m i s t i c a l l y c o rre ct
Glean Agents move from fast to multi-step execution, dep ending on the task.
Glean 16Assistant can also route queries to pre-define d agents. An agent can
b e triggere d during a conversation and resp ond using
a sp ecific knowle dge base. For example, an HR team might build an
agent to answer questions ab out time-off, holidays, and other topics
covere d in p olicy documentation. When a user asks an HR-relate d
question, they’re automatically route d to the appropriate agent for a
resp onse.
A conversational agent that answers HR-relate d questions, using
branching logic to tailor resp onses to country-sp ecific p olicies.
Glean 17Company
The conversational HR agent integrate d into Glean Assistant to answer
questions base d on a sp ecific knowle dge base.
While we optimize the Assistant exp erience for b oth accuracy and
latency, we also give users the ability to opt-in to additional time for
more complex, research-base d tasks. Deep research mo de builds on
Glean’s agentic reasoning engine to supp ort comprehensive
research and analysis from across a multitude of sources. The goal
b ehind deep research is to mimic how an exp ert would approach
researching a task, sifting through data, refining their
understanding, and ultimately pro ducing a well-structure d and
informative research analysis.
Glean 18Tools: Building a scalable
tools framework
When intro ducing a library of tools, including data analysis, web
search, exp ert search, and more, we had to determine the right
level of tool abstraction. The level of abstraction shap es the
b oundaries b etween tools and facilitates smooth handoffs
b etween tool-base d steps within an agentic workflow. We create
tools that have clearly define d tasks and succinct descriptions.
Each tool can only p erform a single task and must have a fixe d
input and output format.
During the planning stage of the agentic reasoning engine, tools
are selecte d for each execution step. Picking the right tool to fit
the plan is made p ossible by workflow search, which enables Glean
to scale its supp ort for tools. The plan can dictate either the use of
a fixe d set of tools for a single step or instructions for how to use
tools base d on conditional logic. The latter allows for tool-use to b e
more dynamic, using branching to determine how the set of tools
should b e use d base d on outputs from previous steps.
Glean 19Read To ols
Glean search
L L Ms lack the enterprise context re quire d for agents to make
informe d, grounde d decisions. While knowle dge stores hold this
context, a search system is re quire d to retrieve the relevant
information. In the enterprise, tasks vary significantly- from
finding exp erts to retrieving authoritative p olicies- and each
re quires a different search approach.
To extract the right context for these diverse scenarios, Glean
develop e d a hybrid search system that is b oth p ermissions-aware
and capable of handling various typ es of queries. This
architecture integrates a self-learning language mo del, a lexical
search algorithm, and a knowle dge graph.
Self-learning language mo del:
Built on the foundational elements
of BERT, Glean’s proprietary mo del is customize d for each
enterprise and continuously learns the company’s dialect,
projects, terms, and teams. In the first six months, search quality
typically improves by 20% due to continuous self-learning.
Lexical search:
Glean re designe d lexical search for the
heterogeneity of enterprise applications- Slack comments are
short and lack titles, Jira tickets are ab out a sp ecific issue but
the overarching project context lives in an epic, etc.- to
understand the purp ose of every data store.
Glean 20Knowle dge graph: The knowle dge graph captures the
relationships b etween p eople, activities, and content to p ower a
deep er understanding of enterprise data across enterprise
applications. By reasoning over the knowle dge graph, it’s
p ossible to identify patterns and uncover relationships b etween
entities that aren’t explicitly state d, enabling smarter decisions
ab out which content to surface base d on those connections.
When reading information, Glean doesn’t just fetch data—it uses
a Google-like search approach by centralizing data mo deling and
indexing across your entire enterprise. This metho d gives Glean
full context, allowing it to pull data from multiple sources to
answer a query. In fact, on average, three data sources are use d
to answer a single query.
Glean Example
Personal knowle dge graph
Let’s look at the example of how search is use d to help answer
questions like “what did I work on this week?” or “help me
prepare for my p erformance review.”
Employees generate a continuous stream of activity across
enterprise systems—authoring documents, attending meetings,
submitting co de, filing tickets. While humans can intuitively
associate these actions with sp ecific tasks, projects, and
strategic objectives, it’s hard for AI systems to do out-of-the-b ox.
Knowle dge graphs fill this gap by mo deling the connections
b etween p eople, content, and activities to create a dynamic map
of work. However, constructing knowle dge graphs to answer
Glean 21these p ersonalize d questions is non-trivial. Task-switching is
fre quent, making temp oral se quencing an unreliable signal. Many
activities also lack rich signals—Jira tickets or calendar events
may contain only minimal text and interaction data, limiting
inference. Additionally, when work items are interdep endent or
overlapping, disambiguating which activities b elong to which
tasks b ecomes increasingly complex.
To tackle this problem, we starte d with a basic entity structure
calle d the p ersonal knowle dge graph, consisting of4
2 Activities: An activity is an action p erforme d by the user
across tool@
2 Sub-tasks: A sub-task is inferre d by a set of actions taken
within a p erio d of tim/
2 Tasks: Aggregation of multiple sub-tasks that relate to an
inferre d goal or job to b e done
This structure builds on our enterprise knowle dge graph, which
enables p ersonalization at the company and team levels. By
layering the p ersonal knowle dge graph with additional enterprise
context, we can overcome some of the inherent signal limitations
in individual work- tapping into signals from coworkers to deliver a
more p ersonalize d user exp erience.
The day in the life of a pro duct manager could revolve around
researching and drafting a pro duct re quirements document as
well as finalizing pricing for a feature. Glean is able to map these
activities and store ones that are more closely relate d as sub-
tasks, under a larger task umbrella, as seen in the example b elow.
Glean 22User Actions
Read 10 issues relate d to
“calendar queries”
User Actions
Search calls relate d to
“Google Calendar connector”
User Actions
Draft “Pro duct re quirements
document for Google
Calendar feature”
User Actions
Listen to 5 calls relate d to
“Google Calendar connector”
Sub-task
Research customer fee dback
on Google Calendar connector
Sub-task
Draft pro duct re quirements document
on Google Calendar feature
User Actions
Document customer interest
Task
P ro d uct re q u i rem en t s for c a len d ar fe atu re
do c u m en tat ion
User Actions
Read chats relate d to “Google
calendar fee dback”
Sub-task
Research issues relate d to
Google Calendar connector
Sub-task
Research documentation on
Google Calendar connector
User Actions
Search for issues relate d to
“calendar queries”
User Actions
Read 3 documentation
articles relate d to calendars
User Actions
Search for “Calendar
documentation”
Sub-task
Research comp etiti v e pricing
User Actions
Search comp etitors
“Meeting assistant apps”
User Actions
Document costing decisions
User Actions
Document comp etiti v e
offerings
Task
C o s t i n g - i n form e d fe atu re go de ci s ion on c a len d ar fe atu re
or n o - go
User Actions
Research associate d costs
Sub-task
Research costs
User Actions
Share analysis w ith
finance team
User Actions
Document costing analysis
Sub-task
Decide on feature supp ort
gi v en costing analysis
Sub-task
Re v ie w cost analysis
User Actions
Sche dule feature
costing re v ie w
User Actions
Feature costing meeting
A v isual display of the inferre d sub-tasks and tasks base d on user-generate d
acti v ities in the p ersonal kno w le dge graph.
Glean 23Data analysis
Generative AI can pro duce multiple correct resp onses, in contrast
to data analysis where a deterministic answer is derive d from
exhaustively examining structure d or unstructure d data.
Structure d data analysis
Glean indexes database metadata to supp ort structure d data
analysis. Structure d data relies on pre define d schemas,
relationships b etween columns and rows, and complex links across
tables and materialize d views—a fundamentally different data
mo del that generative AI wasn’t designe d to manage effectively.
Glean enhances structure d data analysis by understanding the
schema of each database, from analytics platforms like Databricks
to business applications like Salesforce and Jira. It achieves this by
indexing metadata and business logic, allowing agents to navigate
and interpret structure d data efficiently.
Unstructure d data analysis
You’ve probably use d an L L M to ask it to return a list of values, say
“all opp ortunities for a given quarter”, only to find that it returns a
subset of results. Or, to compute a metric like “conversion rates”,
but b e shown radically different results from the day b efore. With
data analysis supp ort, we have to teach the L L M and give it the
tools to comprehend numerical concepts.
Let’s look at how Glean solves the nuances of data analysis using
real world examples.
Glean 24Glean Example
Data analysis query
The first step in data analysis is helping the L L M to identify when
the question b eing aske d relates to data analysis. Just
identifying that it’s a data analysis query is not sufficient alone-
we also nee d to determine the scop e of the analysis. For
example, sometimes a user is looking to analyze a single
document or structure d data source. In other situations, they’re
looking not at an individual document or entity but across the
corpus to identify the information.
When looking across the corpus there’s an adde d challenge
that’s capture d in examples4
+ Example A: List all the Jira tickets assigne d to me, op en and
close d in a table9
+ Example B: What are all of the data connectors available in
Glean?
Example A is looking for an exhaustive search of all Jira tickets
that are assigne d to me, with this information spread across
multiple Jira tickets. Example B, in contrast, is looking for the
canonical document. There may b e many documents in the
corpus relate d to supp orting data connectors, but the one to
analyze is the source of truth. This is where the p ower of Glean’s
knowle dge graph comes into play, helping to find authoritative
sources base d on a variety of signals, including linking and
p opularity.
Once the query plan is built, the agent moves into the execution
phase, leveraging our data analysis tool. With data analysis, the
system writes and runs Python co de to answer a diverse range
of data questions and generate charts and graphs.
Glean 25We’ve designe d data analysis to supp ort a numb er of different
data typ es and traine d it to loop, iterating until it solves the
co ding or math problem.
When we think ab out data analysis queries, we can b oth run a
simple query to get an exhaustive list of resp onses or we can
take an additional set of actions, like sums, counts, group bys. In
the latter, we’ll break the data analysis task down into steps and
p erform looping. Let’s look at the example:
User-generated chat
Write co de to list all the Jira tickets
assigne d to me. Group by severity and
provide an average of the resolution times.
Plan
Generate a query plan and identify the tools.
Data analysis tool
List all Jira tickets assigne d to me.
Loop over the Jira tickets, grouping
by severity.
Loop over the Jira tickets, averaging the
resolution time by severity group.
Respond
Create a chart of all the Jira tickets that
you found.
An example of an Agent using looping to iteratively explore a dataset.
Glean 26In the looping example ab ove, we let the agent iteratively explore
a dataset—refining its queries and gathering results until no new
data is found. Each loop examines the same set of Jira tickets
but looks for different information (such as severity in one step
and resolution times in another). The output of earlier steps, like
grouping by severity, is use d for subse quent calculations, such
as averaging resolution times. By breaking down the process into
clear execution steps and using looping, we guide the L L M to
reach a deterministic output.
Write to ols
Glean actions
Agents also have the capability to take action back in the systems
of record, from resetting a password to moving a sales deal stage
to up dating a supp ort ticket. Glean acts as the central hub for
getting work done and coordinates actions across enterprise
applications, even working in tandem with third-party agents.
To scale actions, Glean first uses its search capability to identify
the relevant tool. Within each tool, there’s a set of actions that can
b e made available via the API. We teach the agent around b oth the
availability of actions and the sp ecific inputs that are nee de d for
each action to generate a successful resp onse.
Glean 27While it can b e easy to take a single action in an enterprise
application, such as triggering the writing of an email, the real
complexity in actions emerge when it comes to customization of
systems and automate d business logic. Many ERP systems are
highly configurable, building different logic b etween comp onents
and re quirements. Furthermore, there’s usually a high-level of
automation involve d, including b oth re quire d fields to put a re quest
into motion, or to move an action forward in a project or initiative.
Building a library of write actions re quires an underlying
understanding of b oth enterprise applications and business
process logic using an event-driven architecture.
Glean Example
IT service desk ticket
Let’s look at an example where a user query nee ds to b e resolve d
through an IT service desk ticket.
Glean first categorizes the query, figuring out the agentic
workflow and tools that it nee ds to answer the user query. In
cases where the task involves submitting a Jira Service
Management (JSM) re quest, it’s not enough to simply recognize
the nee d to create a re quest; Glean must also determine the
appropriate service desk, re quest typ e, and auto-p opulate
mandatory fields using company data. Only after knowing this
information, can it actually automate work on the user’s b ehalf.
Since this process is initiate d within Glean Assistant, the user
can review and submit the re quest without ever leaving the
interface. This approach allows employees to accomplish tasks
Glean 28with minimal knowle dge of the organi z ation’s processes —a
common scenario in large-scale enterprises with a numb er of
teams and processes in play. R ather, G lean does the heav y lifting
of identifying the root issue, determining the tools nee de d to
resolve it, sp ecifying the re quest , and filling in the re quire d fields
—all within G lean Assistant.
Conversational agent
You are an assistant that helps employees
answer IT relate d questions
User-generated query
I want to re quest an upgrade to my laptop
Think
Determine the appropriate tool
Jira Service Management tool
Determine the appropriate service desk
Jira Service Management tool
Determine if the users laptop is more
than two years old
Y E S N O
Jira Service Management tool
Determines and auto-p opulates the
re quire d fields
Respond
Explain why the laptop upgrade is denie d
Jira Service Management tool
Submits a Jira Service Management re quest
An example of an Agent using the Jira Service Management tool.
Glean 29Glean MCP supp ort
Glean offers supp ort for actions using op en protocols like
Anthropic’s Mo del Context Protocol (MCP) and, recognizing the
emergence of several op en-source agent communication
protocols, plans to also supp ort Agent Protocol from LangChain,
Agent2Agent Protocol from Google, and AGNTCY from Cisco,
LangChain, and Galileo.
MCP standardizes connections b etween agents, connectors, and
services that provide/
resources (context
prompts (template d messages
tools (functions to execute)
An example showcasing how an MCP server connects Glean to a
supp ort application to facilitate issue resolution.
Glean 30With Glean acting as the host, it can easily connect to any
enterprise tool that supp orts MCP—expanding our capabilities
with minimal engineering effort. While the example ab ove
involves resolving a supp ort ticket, in the future, Glean will
delegate steps to a myriad of systems and even generate work
for external agents, thanks to bidirectional communication
protocols that enable dynamic, trigger-free task execution. Using
MCP and other protocols allows us to grow our supp ort for
actions, while still using Glean’s underlying search capabilities to
determine the b est tool for every agent step.
Glean has built a comprehensive library of tools for horizontal AI.
These tools enable enterprises, many with 50+ applications, to b e
able to index their data and take action.
Glean 31Designing for L L M choice
Glean is an op en, extensible platform that incorp orates L L Ms,
agent frameworks, agent communication protocols, and more—
integrating emerging technologies to further advance AI in the
enterprise. We focus on delivering an enterprise AI exp erience that
simplifies agent creation using natural language, grounds AI in
enterprise data, orchestrates agents across the organization, and
actively governs agents at scale.
Customers can choose their preferre d L L M for enterprise AI, with
Glean supp orting providers such as Anthropic, Op enAI, Google
Vertex AI, and Amazon Be drock. We continuously evaluate and
supp ort the latest mo del advancements and, in 2024, upgrade d
our mo dels six times base d on real-world evaluations. To ensure a
consistent user exp erience across mo dels, we use L L M judges to
rigorously compare how different mo dels resp ond to real queries.
As we design for L L M choice, Glean’s agentic reasoning engine
must ensure that queries can b e route d to multiple L L Ms
efficiently while also aligning instructions with L L Ms that
increasingly integrate chain-of-thought techniques. At Glean, this
meant turning early prompt engineering insights into a scalable,
mo del-agnostic framework that supp orts multiple L L Ms.
Glean engineers were some of the earliest prompt engineers—
learning first hand how subtle changes in instructions, wording, or
ordering impact L L M p erformance. Prompting is a bit like solving a
Rubrik’s Cub e: tweak multiple elements nee d to b e tweake d to get
everything aligne d. By twisting one side, or in the case of
prompting changing the wording or order, everything else is
affecte d- sometimes for the b etter, sometimes not.
Glean 32We quickly notice d key differences across L L Ms: some (like early
Claude) were overly rigid, only resp onding to provide d context;
others (like early ChatGPT) leane d toward helpfulness, sometimes
at the cost of accuracy or style. That meant our approach
couldn’t b e static—we’ve layere d in prompt techniques when
nee de d, and stripp e d them back as mo dels mature d. Our
philosophy now favors giving L L Ms more free dom, while
grounding them in relevant examples. As we’ve scale d, we’ve
b een able to mature from manual prompting to using L L M judges-
training judges to excel at formatting and voice consistency.
Prompting is no longer an art—it’s an iterative, systematize d
process for delivering consistent, enterprise-grade AI.
This system-level thinking extends b eyond prompt construction
to query routing itself. Glean’s agentic reasoning engine uses
smaller, cost-effective mo dels for simpler tasks, like single-tool
searches or follow-up suggestions in Assistant. This helps scale
agents cost-effectively while maintaining low latency, even as
agentic workflows b ecome more complex. And as mo del
sp ecialization deep ens, Glean’s op en platform is ready to route
queries to the L L Ms b est suite d for the task—making mo del
routing a key to supp orting more complex workloads.
Glean 33Evaluating agents
Agent evaluation measures b oth an agent’s overall ability to
achieve its goal and the effectiveness of each tool within its
workflow.
At Glean, we group similar sets of queries together into classes—
like data analysis, meeting prep, Q&A, issue resolution, and how-
to guides—and craft tailore d instructions that reflect the unique
goal of each class. For every query class, we define what “goo d”
looks like: creativity for writing tasks, helpfulness for resolving
issues, coherence for instructional guides. We then build
evaluation datasets and manually annotate them to provide rich,
human-level insights. These examples are fe d back into the agent
to help it classify and train for each query class.
When it comes to agents, success isn’t just ab out whether they
reach the final goal—it’s ab out how well they navigate each step
along the way. We design our tool-base d evaluations to capture
the se quence of steps that lead to a deterministic, accurate
output. By evaluating p erformance at every checkp oint, using
detaile d traces of each agent interaction, we’re able to sp ot
exactly where things go off track. This level of visibility lets us
iterate fast and refine b oth agent b ehavior and instructions. We
test different instruction sets, measure their effectiveness, and
use those insights to refine agent p erformance.
Glean 34Alongside human review, we rely on L L M judges—language mo dels
traine d to evaluate agent outputs within sp ecific query classes.
These judges do more than check for accuracy; they assess
whether the agent achieve d its goal and evaluate resp onses for
correctness, completeness, and grounding. Grounding is critical—
it ensures resp onses are not just accurate, but also relevant to
the organization’s unique context. Correctness, in our view, isn’t
just ab out b eing right—it’s ab out b eing efficient. By measuring
how efficiently an agent completes a task, we can apply query
optimization principles to cut down on cost, avoid re dundant L L M
calls, and sp ee d up results.
We take into account subjective factors like tone, style, and
length by evaluating resp onse satisfaction. Glean captures b oth
explicit fee dback (thumbs up, thumbs down, comments) and
implicit signals (like session abandonment or switching from
Assistant to Search). These signals matter, but they’re messy and
hard to interpret at scale. That’s why we use L L Ms to analyze
and cluster fee dback, helping us surface recurring issues and
focus on what to fix.
We’ve recognize d that relying on L L M judges also means that we
nee d those judges to b e robust and reliable. It’s not enough for a
judge to pro duce a reasonable assessment once—it must do so
consistently across similar inputs. Without this consistency, noise
is injecte d into the evaluation loop and p otentially optimizes
toward unreliable signals. So, we rigorously test L L M judges for
variance: running the same or closely relate d queries through
them multiple times and measuring stability in their resp onses.
Glean 35Glean Example
People seeking query evaluations
Take p eople-relate d queries as an example. Ab out 1 in 10 queries
at Glean are ab out finding information on coworkers. But not all
p eople-relate d queries are the same—they vary in structure and
intent. We group them into different typ es, here’s a few
examples6
3 Navigational queries: Intention to quickly locate a sp ecific
individual base d on their title or role (ie: Who is the CEO? Who
is the current pushmaster? Who is my manager’s manager?(
3 Exp ert queries: Intention is to identify the right p eople or
teams to help with a task, tapping into exp ertise and
exp erience. (ie: Who are the exp erts at Glean on GCP
infrastructure?(
3 Statistical queries: Intention is to aggregate data or compute
metrics relate d to an individual or group (ie: What is Ashley’s
state date? Who was the first designer to join Glean?)
At Glean, we create evaluation sets that represent each query
class, base d on real usage data and fee dback. This helps us
identify where things go wrong—like when exp ert queries
struggle to traverse an organizational chart or statistical queries
re quire b etter supp ort for structure d analysis.
Once we understand the p erformance issues, we can start fixing
them. That might mean refining the prompt, adjusting tool
instructions, or breaking a query into multiple sub-steps. For
example, answering “Who is my manager’s manager?” re quires
reasoning through two levels of the organizational chart, a task
b est suite d to multiple queries.
Glean 36When making p erformance improvements, we draw from b est
practices tailore d to each query class, test changes continuously,
and track improvements using metrics like completeness and
correctness. This helps us design agents that actually
understand and p erform the work employees accomplish
everyday in the enterprise.
Glean’s agentic reasoning engine
scales with search
In this white pap er, we describ e d the foundational comp onents of
agentic systems and how Glean designe d its agentic reasoning
engine. The key takeaways include:
Ground agents in c ontext: Grounding agents in context is what
makes autonomous agents a reality. Achieving the right context for
each query re quires indexing and knowle dge graphs.
Scale workflows and to ols using search: Search isn’t just for data
retrieval—it’s use d for determining workflows, training agents, and
selecting the right tools for each step.
Understand and refine query classes: Mo dels can’t inherently
grasp how to work with tools and workflows. Ultimately, turning
mo dels into agents re quires understanding and providing
instructions to different query classes in the enterprise.
Build an op en, extensible platform: To stay at the forefront of agent
innovation, Glean focuses on delivering an easy-to-use agent
exp erience while continuously integrating the latest L L Ms,
communication protocols, and evaluation frameworks. Our platform
is designe d to add new features, integrate with external services,
and adapt to evolving nee ds without re quiring a complete overhaul.
Agents enhance L L Ms by grounding them in enterprise knowle dge,
e quipping them with the right tools and workflows, and enabling
continuous learning. In this white pap er, we explore d the designing
and evaluating of individual agents; soon, we’ll showcase how an
entire network of agents can work together. As agent networks
scale- search b ecomes more imp ortant than ever- resp onsible for
discovering agents and routing actions across an increasingly
complex landscap e.